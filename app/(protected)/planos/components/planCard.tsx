"use client";

import SubscribeButton from "./subscribeButton";

type Props = {
    slug: string;
    name: string;
    price: string;
    features: string[];
    active: boolean;
};

export default function PlanCard({ slug, name, price, features, active }: Props) {
    return (
        <div
            className={`border rounded-2xl p-8 shadow-md flex flex-col justify-between transition ${
                active ? "border-teal-500 bg-teal-50" : "border-gray-300 bg-white"
            }`}
        >
            <div>
                <h3 className="text-2xl font-bold text-gray-800">{name}</h3>
                <p className="text-3xl font-extrabold text-gray-800 mt-2">{price}</p>

                <ul className="mt-6 space-y-2 text-gray-700">
                    {features.map((f) => (
                        <li key={f}>• {f}</li>
                    ))}
                </ul>
            </div>

            <SubscribeButton slug={slug} active={active} />
        </div>
    );
}
