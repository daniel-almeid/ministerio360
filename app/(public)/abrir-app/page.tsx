"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Smartphone } from "lucide-react";

// Página de volta ao aplicativo depois de confirmar o e-mail (conta criada pelo app)
const ANDROID_LINK = "intent://auth/login#Intent;scheme=ministerio360;package=com.ministerio360.app;end";
const APP_LINK = "ministerio360://auth/login";

export default function AbrirAppPage() {
    const [link, setLink] = useState(APP_LINK);
    const [mobile, setMobile] = useState(true);

    useEffect(() => {
        const ua = navigator.userAgent;
        const android = /android/i.test(ua);
        setMobile(android || /iphone|ipad|ipod/i.test(ua));
        if (android) {
            setLink(ANDROID_LINK);
            // Tenta abrir sozinho; se o navegador não deixar, o botão abaixo resolve
            const t = setTimeout(() => {
                window.location.href = ANDROID_LINK;
            }, 400);
            return () => clearTimeout(t);
        }
    }, []);

    return (
        <main className="min-h-dvh flex items-center justify-center bg-[#F7FAFC] px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 text-center shadow-sm">
                <CheckCircle2 className="mx-auto h-12 w-12 text-teal-600" />
                <h1 className="mt-4 text-2xl font-bold text-gray-800">E-mail confirmado!</h1>
                <p className="mt-2 text-gray-600">
                    {mobile
                        ? "Sua conta está pronta. Volte ao aplicativo e faça login para continuar."
                        : "Sua conta está pronta. Abra o aplicativo Ministério360 no seu celular e faça login para continuar."}
                </p>

                {mobile && (
                    <a
                        href={link}
                        data-ph="abrir_app"
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700"
                    >
                        <Smartphone className="h-5 w-5" />
                        Abrir o aplicativo
                    </a>
                )}

                <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-teal-700 underline">
                    Continuar pelo site
                </Link>
            </div>
        </main>
    );
}
