"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PlanSlug } from "../types";
import PaymentCardModal, { CardFormValues } from "./paymentCardModal";

type Props = {
    slug: PlanSlug;
    name: string;
    price: string;
    features: string[];
    current: PlanSlug;
    active: boolean;
};

const PAGARME_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY!;

async function tokenizeCard(card: {
    number: string;
    holderName: string;
    expMonth: string;
    expYear: string;
    cvv: string;
}) {
    const res = await fetch(`https://api.pagar.me/core/v5/tokens?appId=${PAGARME_PUBLIC_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type: "card",
            card: {
                number: card.number.replace(/\s/g, ""),
                holder_name: card.holderName,
                exp_month: card.expMonth,
                exp_year: card.expYear,
                cvv: card.cvv,
            },
        }),
    });

    const json = await res.json();

    if (!res.ok || !json?.id) {
        throw new Error(json?.message || "Cartão inválido. Verifique os dados e tente novamente.");
    }

    return json.id as string;
}

export default function PlanCard({ slug, name, price, features, current, active }: Props) {
    const [modalOpen, setModalOpen] = useState(false);

    const isSelected = current === slug;
    const isActive = active && isSelected;

    async function confirmarAssinatura(values: CardFormValues) {
        const session = await supabase.auth.getSession();
        const user = session.data.session?.user;

        if (!user?.email) {
            throw new Error("Sessão expirada. Faça login novamente.");
        }

        const name =
            user.user_metadata?.full_name || user.user_metadata?.name || "Usuário";

        const cardToken = await tokenizeCard({
            number: values.number,
            holderName: values.holderName,
            expMonth: values.expMonth,
            expYear: values.expYear,
            cvv: values.cvv,
        });

        const streetLine = `${values.street}, ${values.number_address}${
            values.complement ? " - " + values.complement : ""
        }`;

        const res = await fetch("/api/pagarme/create-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                plan_slug: slug,
                card_token: cardToken,
                email: user.email,
                name,
                document: values.document,
                phone: { area_code: values.areaCode, number: values.phoneNumber },
                address: {
                    line_1: streetLine,
                    zip_code: values.zipCode,
                    city: values.city,
                    state: values.state,
                },
            }),
        });

        const data = await res.json();

        if (!res.ok || !data?.success) {
            throw new Error(data?.error || "Erro ao criar assinatura.");
        }

        // Força a emissão de um token novo, já com o plano atualizado —
        // sem isso, o plano só refletiria depois de um novo login.
        await supabase.auth.refreshSession();

        setModalOpen(false);
        window.location.reload();
    }

    return (
        <>
            <div
                className={`border rounded-2xl p-6 shadow-md flex flex-col justify-between
                    ${isActive ? "border-teal-600 bg-teal-50" : isSelected ? "border-teal-600 bg-teal-100" : "border-gray-300 bg-white"}`}
            >
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">{name}</h3>
                    <p className="text-3xl font-extrabold text-gray-800 mt-2">{price}</p>

                    <ul className="mt-6 space-y-3">
                        {features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-gray-700">
                                <span className="text-teal-600 font-bold text-lg">•</span>
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {isActive ? (
                    <button
                        disabled
                        className="mt-8 py-3 px-4 rounded-xl font-semibold text-white bg-gray-400 cursor-not-allowed"
                    >
                        Plano atual
                    </button>
                ) : (
                    <button
                        onClick={() => setModalOpen(true)}
                        className="mt-8 py-3 px-4 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700"
                    >
                        Assinar
                    </button>
                )}
            </div>

            <PaymentCardModal
                open={modalOpen}
                planName={name}
                price={price}
                onClose={() => setModalOpen(false)}
                onSubmit={confirmarAssinatura}
            />
        </>
    );
}