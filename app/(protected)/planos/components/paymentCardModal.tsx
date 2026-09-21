"use client";

import { useRef, useState } from "react";
import { CreditCard, MapPin, User, X, Loader2 } from "lucide-react";

type Props = {
    open: boolean;
    planName: string;
    price: string;
    onClose: () => void;
    onSubmit: (values: CardFormValues) => Promise<void>;
};

export type CardFormValues = {
    number: string;
    holderName: string;
    expMonth: string;
    expYear: string;
    cvv: string;
    document: string;
    areaCode: string;
    phoneNumber: string;
    zipCode: string;
    street: string;
    number_address: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
};

const EMPTY: CardFormValues = {
    number: "",
    holderName: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    document: "",
    areaCode: "",
    phoneNumber: "",
    zipCode: "",
    street: "",
    number_address: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
};

// ===== Máscaras =====

function maskCardNumber(v: string) {
    return v
        .replace(/\D/g, "")
        .slice(0, 19)
        .replace(/(\d{4})(?=\d)/g, "$1 ")
        .trim();
}

function maskDocument(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 14);
    if (d.length <= 11) {
        // CPF: 000.000.000-00
        return d
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    // CNPJ: 00.000.000/0000-00
    return d
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function maskCep(v: string) {
    return v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

function maskPhone(v: string) {
    return v.replace(/\D/g, "").slice(0, 9);
}

function maskDigits(v: string, max: number) {
    return v.replace(/\D/g, "").slice(0, max);
}

export default function PaymentCardModal({ open, planName, price, onClose, onSubmit }: Props) {
    const [values, setValues] = useState<CardFormValues>(EMPTY);
    const [loading, setLoading] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [error, setError] = useState("");

    const refs = {
        number: useRef<HTMLInputElement>(null),
        holderName: useRef<HTMLInputElement>(null),
        expMonth: useRef<HTMLInputElement>(null),
        expYear: useRef<HTMLInputElement>(null),
        cvv: useRef<HTMLInputElement>(null),
        document: useRef<HTMLInputElement>(null),
        areaCode: useRef<HTMLInputElement>(null),
        phoneNumber: useRef<HTMLInputElement>(null),
        zipCode: useRef<HTMLInputElement>(null),
        street: useRef<HTMLInputElement>(null),
        number_address: useRef<HTMLInputElement>(null),
        complement: useRef<HTMLInputElement>(null),
        neighborhood: useRef<HTMLInputElement>(null),
        city: useRef<HTMLInputElement>(null),
        state: useRef<HTMLInputElement>(null),
    };

    if (!open) return null;

    function set<K extends keyof CardFormValues>(key: K, value: string) {
        setValues((prev) => ({ ...prev, [key]: value }));
    }

    function focusNext(ref: React.RefObject<HTMLInputElement | null>) {
        ref.current?.focus();
    }

    async function handleCardNumberChange(raw: string) {
        const masked = maskCardNumber(raw);
        set("number", masked);
        const digits = masked.replace(/\s/g, "");
        if (digits.length >= 16) focusNext(refs.holderName);
    }

    function handleExpMonthChange(raw: string) {
        const v = maskDigits(raw, 2);
        set("expMonth", v);
        if (v.length === 2) focusNext(refs.expYear);
    }

    function handleExpYearChange(raw: string) {
        const v = maskDigits(raw, 2);
        set("expYear", v);
        if (v.length === 2) focusNext(refs.cvv);
    }

    function handleCvvChange(raw: string) {
        const v = maskDigits(raw, 4);
        set("cvv", v);
        if (v.length >= 3) {
            // CVV pode ter 3 ou 4 dígitos — não força avanço automático aqui
        }
    }

    function handleAreaCodeChange(raw: string) {
        const v = maskDigits(raw, 2);
        set("areaCode", v);
        if (v.length === 2) focusNext(refs.phoneNumber);
    }

    async function handleCepChange(raw: string) {
        const masked = maskCep(raw);
        set("zipCode", masked);

        const digits = masked.replace(/\D/g, "");
        if (digits.length === 8) {
            setCepLoading(true);
            try {
                const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
                const data = await res.json();

                if (!data.erro) {
                    setValues((prev) => ({
                        ...prev,
                        street: data.logradouro || prev.street,
                        neighborhood: data.bairro || prev.neighborhood,
                        city: data.localidade || prev.city,
                        state: data.uf || prev.state,
                    }));
                    focusNext(refs.number_address);
                }
            } catch {
                // Silencioso — usuário preenche manualmente se a busca falhar
            } finally {
                setCepLoading(false);
            }
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const required: (keyof CardFormValues)[] = [
            "number", "holderName", "expMonth", "expYear", "cvv",
            "document", "areaCode", "phoneNumber",
            "zipCode", "street", "number_address", "city", "state",
        ];

        for (const key of required) {
            if (!values[key]?.trim()) {
                setError("Preencha todos os campos obrigatórios para continuar.");
                return;
            }
        }

        setLoading(true);
        try {
            await onSubmit(values);
        } catch (err: any) {
            setError(err.message || "Erro ao processar pagamento.");
        } finally {
            setLoading(false);
        }
    }

    const inputClass =
        "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none " +
        "focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-colors placeholder:text-gray-400";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl max-h-[92vh] flex flex-col overflow-hidden">
                {/* Header fixo */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Assinar {planName}</h2>
                        <p className="text-xl font-extrabold text-teal-700">{price}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5">
                    {/* Cartão */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <CreditCard size={16} className="text-teal-600" />
                            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">
                                Dados do cartão
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <input
                                ref={refs.number}
                                placeholder="Número do cartão"
                                inputMode="numeric"
                                value={values.number}
                                onChange={(e) => handleCardNumberChange(e.target.value)}
                                className={inputClass}
                            />
                            <input
                                ref={refs.holderName}
                                placeholder="Nome impresso no cartão"
                                value={values.holderName}
                                onChange={(e) => set("holderName", e.target.value.toUpperCase())}
                                className={inputClass + " uppercase"}
                            />
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    ref={refs.expMonth}
                                    placeholder="MM"
                                    inputMode="numeric"
                                    value={values.expMonth}
                                    onChange={(e) => handleExpMonthChange(e.target.value)}
                                    className={inputClass + " text-center"}
                                />
                                <input
                                    ref={refs.expYear}
                                    placeholder="AA"
                                    inputMode="numeric"
                                    value={values.expYear}
                                    onChange={(e) => handleExpYearChange(e.target.value)}
                                    className={inputClass + " text-center"}
                                />
                                <input
                                    ref={refs.cvv}
                                    placeholder="CVV"
                                    inputMode="numeric"
                                    value={values.cvv}
                                    onChange={(e) => handleCvvChange(e.target.value)}
                                    className={inputClass + " text-center"}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Titular */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <User size={16} className="text-teal-600" />
                            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">
                                Dados do titular
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <input
                                ref={refs.document}
                                placeholder="CPF ou CNPJ"
                                inputMode="numeric"
                                value={values.document}
                                onChange={(e) => set("document", maskDocument(e.target.value))}
                                className={inputClass}
                            />
                            <div className="grid grid-cols-4 gap-2">
                                <input
                                    ref={refs.areaCode}
                                    placeholder="DDD"
                                    inputMode="numeric"
                                    value={values.areaCode}
                                    onChange={(e) => handleAreaCodeChange(e.target.value)}
                                    className={inputClass + " text-center"}
                                />
                                <input
                                    ref={refs.phoneNumber}
                                    placeholder="Telefone"
                                    inputMode="numeric"
                                    value={values.phoneNumber}
                                    onChange={(e) => set("phoneNumber", maskPhone(e.target.value))}
                                    className={inputClass + " col-span-3"}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Endereço */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin size={16} className="text-teal-600" />
                            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">
                                Endereço de cobrança
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    ref={refs.zipCode}
                                    placeholder="CEP"
                                    inputMode="numeric"
                                    value={values.zipCode}
                                    onChange={(e) => handleCepChange(e.target.value)}
                                    className={inputClass}
                                />
                                {cepLoading && (
                                    <Loader2
                                        size={16}
                                        className="animate-spin text-teal-500 absolute right-3 top-1/2 -translate-y-1/2"
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    ref={refs.street}
                                    placeholder="Rua"
                                    value={values.street}
                                    onChange={(e) => set("street", e.target.value)}
                                    className={inputClass + " col-span-2"}
                                />
                                <input
                                    ref={refs.number_address}
                                    placeholder="Número"
                                    inputMode="numeric"
                                    value={values.number_address}
                                    onChange={(e) => set("number_address", e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    ref={refs.complement}
                                    placeholder="Complemento (apto, bloco...)"
                                    value={values.complement}
                                    onChange={(e) => set("complement", e.target.value)}
                                    className={inputClass}
                                />
                                <input
                                    ref={refs.neighborhood}
                                    placeholder="Bairro"
                                    value={values.neighborhood}
                                    onChange={(e) => set("neighborhood", e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                <input
                                    ref={refs.city}
                                    placeholder="Cidade"
                                    value={values.city}
                                    onChange={(e) => set("city", e.target.value)}
                                    className={inputClass + " col-span-3"}
                                />
                                <input
                                    ref={refs.state}
                                    placeholder="UF"
                                    maxLength={2}
                                    value={values.state}
                                    onChange={(e) => set("state", e.target.value.toUpperCase())}
                                    className={inputClass + " text-center"}
                                />
                            </div>
                        </div>
                    </section>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? "Processando..." : "Confirmar assinatura"}
                    </button>

                    <p className="text-[11px] text-gray-400 text-center">
                        Seus dados de cartão são enviados diretamente e de forma criptografada ao
                        Pagar.me. O Ministério360 não armazena o número do seu cartão.
                    </p>
                </form>
            </div>
        </div>
    );
}