"use client";

import { PlanSlug } from "../types";

type Props = {
    slug: PlanSlug;
    name: string;
    price: string;
    features: string[];
    active: boolean;
};

export default function PlanCard({
    slug,
    name,
    price,
    features,
    active,
}: Props) {
    return (
        <div
            className={`border rounded-2xl p-8 shadow-md flex flex-col justify-between
                ${active ? "border-teal-600 bg-teal-50" : "border-gray-300 bg-white"}`}
        >
            <div>
                <h3 className="text-2xl font-bold text-gray-800">{name}</h3>

                <p className="text-3xl font-extrabold text-gray-800 mt-2">
                    {price}
                </p>

                <ul className="mt-6 space-y-3">
                    {features.map((f) => (
                        <li
                            key={f}
                            className="flex items-start gap-2 text-gray-700"
                        >
                            <span className="text-teal-600 font-bold text-lg">•</span>
                            <span>{f}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {active && (
                <button
                    disabled
                    className="mt-8 py-3 px-4 rounded-xl font-semibold text-white bg-gray-400 cursor-not-allowed"
                >
                    Plano atual
                </button>
            )}
        </div>
    );
}
