// /lib/scalesService.ts
import { supabase } from '../lib/supabaseClient';

type CreateScaleInput = {
    date: string; // ISO date (YYYY-MM-DD)
    event: string;
    responsible: string;
    ministriesIds: string[]; // ids de public.ministries
    // Assignments opcionais: [{ ministryId, memberIds[] }]
    assignments?: { ministryId: string; memberIds: string[] }[];
};

export async function fetchScales() {
    // Busca scales + ministérios relacionados
    const { data, error } = await supabase
        .from('scales')
        .select(`
      id,
      date,
      event_name,
      responsible,
      scale_ministries(
        ministry_id,
        ministries: ministry_id (
          id,
          name
        )
      )
    `)
        .order('date', { ascending: true });

    if (error) {
        console.error('Erro ao carregar escalas:', error.message);
        return [];
    }

    // Mapeia para um formato amigável
    return (data || []).map((row: any) => ({
        id: row.id,
        date: row.date,
        event: row.event_name,
        responsible: row.responsible,
        ministries:
            row.scale_ministries?.map((sm: any) => sm.ministries)?.filter(Boolean) || [],
    }));
}

export async function createScale(payload: CreateScaleInput) {
    // 1) Cria a scale
    const { data: scaleIns, error: scaleErr } = await supabase
        .from('scales')
        .insert({
            date: payload.date,
            event_name: payload.event,
            responsible: payload.responsible,
        })
        .select('id')
        .single();

    if (scaleErr || !scaleIns) {
        throw new Error(scaleErr?.message || 'Falha ao criar escala');
    }

    const scaleId = scaleIns.id as string;

    // 2) Conecta ministérios
    if (payload.ministriesIds.length > 0) {
        const rows = payload.ministriesIds.map((mid) => ({
            scale_id: scaleId,
            ministry_id: mid,
        }));

        const { error: smErr } = await supabase.from('scale_ministries').insert(rows);
        if (smErr) throw new Error(smErr.message);
    }

    // 3) (Opcional) Insere assignments de membros por ministério
    if (payload.assignments && payload.assignments.length > 0) {
        const assRows = payload.assignments.flatMap((a) =>
            a.memberIds.map((memId) => ({
                scale_id: scaleId,
                ministry_id: a.ministryId,
                member_id: memId,
            })),
        );
        if (assRows.length) {
            const { error: asErr } = await supabase.from('scale_assignments').insert(assRows);
            if (asErr) throw new Error(asErr.message);
        }
    }

    return scaleId;
}
