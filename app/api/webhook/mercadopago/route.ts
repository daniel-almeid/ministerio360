import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const mpTopic = body.type;

        if (!mpTopic) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        if (mpTopic !== "preapproval") {
            return NextResponse.json({ received: true });
        }

        const preapprovalId = body.data?.id;
        if (!preapprovalId) {
            return NextResponse.json({ error: "Missing preapproval id" }, { status: 400 });
        }

        const mpRes = await axios.get(
            `https://api.mercadopago.com/preapproval/${preapprovalId}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                },
            }
        );

        const pre = mpRes.data;

        const status = pre.status;
        const planId = pre.preapproval_plan_id;
        const email = pre.payer_email;

        if (!email || !planId) {
            return NextResponse.json({ error: "Missing email or plan" }, { status: 400 });
        }

        const { data: user } = await supabase
            .from("auth.users")
            .select("id, email")
            .eq("email", email)
            .single();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { data: plan } = await supabase
            .from("plans")
            .select("plan_slug")
            .eq("mp_plan_id", planId)
            .single();

        if (!plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        if (status === "authorized") {
            await supabase
                .from("church_profiles")
                .update({ plan_slug: plan.plan_slug })
                .eq("user_id", user.id);

            await supabase.rpc("refresh_church_claim", { p_user_id: user.id });

            return NextResponse.json({
                success: true,
                updated_to: plan.plan_slug,
            });
        }

        if (status === "paused" || status === "cancelled") {
            await supabase
                .from("church_profiles")
                .update({ plan_slug: "free" })
                .eq("user_id", user.id);

            await supabase.rpc("refresh_church_claim", { p_user_id: user.id });

            return NextResponse.json({
                success: true,
                updated_to: "free",
            });
        }

        return NextResponse.json({
            received: true,
            status,
        });
    } catch (err) {
        return NextResponse.json(
            { error: "Webhook error", details: String(err) },
            { status: 500 }
        );
    }
}
