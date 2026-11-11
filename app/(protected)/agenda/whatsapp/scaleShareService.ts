"use client";

import { supabase } from "@/lib/supabaseClient";
import { toWhatsAppNumber } from "@/lib/whatsapp";
import type { ScalePerson, ScaleResponseStatus, ScaleShareData } from "./types";

type AssignRow = {
    ministry_id: string;
    member_id: string;
    response_token: string | null;
    status: string | null;
    responded_at: string | null;
    response_source: string | null;
    response_note: string | null;
};

function asStatus(value?: string | null): ScaleResponseStatus {
    return value === "confirmed" || value === "declined" ? value : "pending";
}

// Uma pessoa pode estar em mais de um ministério na mesma escala: vale a resposta mais recente
function latestByMember(rows: AssignRow[]) {
    const map = new Map<string, AssignRow>();
    for (const row of rows) {
        const current = map.get(row.member_id);
        if (!current || (row.responded_at ?? "") > (current.responded_at ?? "")) map.set(row.member_id, row);
    }
    return map;
}

// Escala com quem está em cada ministério, telefone e resposta de cada um (mesmas regras do app)
export async function fetchScaleShareData(scaleId: string): Promise<ScaleShareData> {
    const { data: session } = await supabase.auth.getSession();
    const churchId = session.session?.user?.app_metadata?.church_id as string | undefined;
    if (!churchId) throw new Error("Igreja não identificada");

    const [{ data: scale, error: scaleError }, { data: assigns, error }] = await Promise.all([
        supabase.from("scales").select("id, date, event_name, responsible, ministries").eq("id", scaleId).single(),
        supabase
            .from("scale_assignments")
            .select("ministry_id, member_id, response_token, status, responded_at, response_source, response_note")
            .eq("scale_id", scaleId)
            .eq("church_id", churchId),
    ]);

    if (scaleError) throw scaleError;
    if (error) throw error;

    const rows = (assigns ?? []) as AssignRow[];
    const saved: { id: string; name: string }[] = Array.isArray(scale.ministries) ? scale.ministries : [];
    const ministryIds = [...new Set([...saved.map((m) => m.id), ...rows.map((a) => a.ministry_id)])];
    const memberIds = [...new Set(rows.map((a) => a.member_id))];

    const [mins, mems] = await Promise.all([
        ministryIds.length
            ? supabase.from("ministries").select("id, name").in("id", ministryIds).eq("church_id", churchId)
            : Promise.resolve({ data: [] as { id: string; name: string }[], error: null }),
        memberIds.length
            ? supabase.from("members").select("id, name, phone").in("id", memberIds).eq("church_id", churchId)
            : Promise.resolve({ data: [] as { id: string; name: string; phone: string | null }[], error: null }),
    ]);

    if (mins.error) throw mins.error;
    if (mems.error) throw mems.error;

    // Nome do ministério: tabela atual; se não achar, o nome salvo na própria escala
    const ministryName = new Map<string, string>(saved.map((m) => [m.id, m.name]));
    for (const m of mins.data ?? []) ministryName.set(m.id, m.name);

    const memberInfo = new Map((mems.data ?? []).map((m) => [m.id, m]));
    const answers = latestByMember(rows);

    const people = new Map<string, ScalePerson>();
    const groups = new Map<string, string[]>();
    for (const id of ministryIds) if (ministryName.get(id)) groups.set(id, []);

    for (const row of rows) {
        const member = memberInfo.get(row.member_id);
        const ministry = ministryName.get(row.ministry_id);
        if (!member || !ministry) continue;

        groups.get(row.ministry_id)?.push(member.name);

        const person = people.get(member.id);
        if (person) {
            if (!person.ministries.includes(ministry)) person.ministries.push(ministry);
        } else {
            const answer = answers.get(member.id);
            people.set(member.id, {
                memberId: member.id,
                name: member.name,
                phone: member.phone ?? null,
                whatsapp: toWhatsAppNumber(member.phone),
                ministries: [ministry],
                token: row.response_token ?? null,
                status: asStatus(answer?.status),
                respondedAt: answer?.responded_at ?? null,
                source: answer?.response_source ?? null,
                note: answer?.response_note ?? null,
            });
        }
    }

    const byName = (a: string, b: string) => a.localeCompare(b, "pt-BR");

    return {
        id: scale.id,
        date: scale.date,
        event: scale.event_name,
        responsible: scale.responsible ?? "",
        people: [...people.values()].sort((a, b) => byName(a.name, b.name)),
        byMinistry: [...groups.entries()].map(([id, members]) => ({
            ministry: ministryName.get(id) as string,
            members: [...members].sort(byName),
        })),
    };
}

// O líder marca a situação de um escalado (vale para todos os ministérios dele nesta escala)
export async function setScaleResponse(scaleId: string, memberId: string, status: ScaleResponseStatus) {
    const pending = status === "pending";

    const { error } = await supabase
        .from("scale_assignments")
        .update({
            status,
            responded_at: pending ? null : new Date().toISOString(),
            response_source: pending ? null : "leader",
            response_note: null,
        })
        .eq("scale_id", scaleId)
        .eq("member_id", memberId);

    if (error) throw error;
}

// "2026-10-20T22:15:00Z" -> "20/10 às 19:15"
export function formatRespondedAt(value?: string | null) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(d.getDate())}/${p(d.getMonth() + 1)} às ${p(d.getHours())}:${p(d.getMinutes())}`;
}
