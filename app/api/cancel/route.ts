import { NextResponse } from "next/server";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
    try {
        const mpToken = process.env.MP_ACCESS_TOKEN;
        if (!mpToken) {
            return NextResponse.json({ error: "Missing MP_ACCESS_TOKEN" }, { status: 500 });
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const email = sessionData.session?.user?.email;
        const userId = sessionData.session?.user?.id;

        if (!email || !userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const res = await axios.get(
            `https://api.mercadopago.com/preapproval/search?payer_email=${email}`,
            {
                headers: { Authorization: `Bearer ${mpToken}` },
            }
        );

        const subscription = res.data.results?.[0];

        if (!subscription) {
            return NextResponse.json({
                success: false,
                message: "User has no active subscription",
            });
        }

        const preId = subscription.id;

        await axios.put(
            `https://api.mercadopago.com/preapproval/${preId}`,
            { status: "paused" },
            {
                headers: { Authorization: `Bearer ${mpToken}` },
            }
        );

        await supabase
            .from("church_profiles")
            .update({ plan_slug: "free" })
            .eq("user_id", userId);

        await supabase.rpc("refresh_church_claim", { p_user_id: userId });

        return NextResponse.json({ success: true, updated_to: "free" });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to cancel subscription", detail: String(error) },
            { status: 500 }
        );
    }
}
