"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

// Campo de senha com o botão de olho para mostrar ou esconder o que foi digitado
export default function PasswordInput({ className = "", ...input }: Props) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <input {...input} type={visible ? "text" : "password"} className={`${className} pr-12`} />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                title={visible ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
                {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
        </div>
    );
}
