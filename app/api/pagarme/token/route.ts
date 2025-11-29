// /app/api/pagarme/token/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { number, holder_name, exp_month, exp_year, cvv } = await req.json();

        const publicKey = process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY!;

        const tokenRes = await fetch("https://api.pagar.me/core/v5/tokens", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + Buffer.from(publicKey + ":").toString("base64"), // CORREÇÃO
            },
            body: JSON.stringify({
                type: "card",
                card: {
                    number,
                    holder_name,
                    exp_month,
                    exp_year,
                    cvv,
                },
            }),
        });

        const tokenJson = await tokenRes.json();

        if (!tokenRes.ok) {
            return NextResponse.json(
                { success: false, error: tokenJson },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            token: tokenJson.id,
        });
    } catch (e) {
        return NextResponse.json(
            { success: false, error: "Erro interno" },
            { status: 500 }
        );
    }
}
