"use client";

import { Loader2 } from "lucide-react";
import { InputField } from "./InputField"
import { SelectField } from "./SelectField";
import { TextareaField } from "./TextareaField";
import { useChurchConfig } from "../hooks/useChurchConfig";

export function ConfigForm() {
    const { formData, handleChange, loading, saving, saveChurchData } = useChurchConfig();

    if (loading) {
        return (
            <div className="flex justify-center items-center py-6 text-gray-500">
                <Loader2 className="animate-spin w-5 h-5 mr-2" /> Carregando...
            </div>
        );
    }

    return (
        <>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dados institucionais */}
                <InputField label="Razão Social" name="corporate_name" value={formData.corporate_name} onChange={handleChange} />
                <InputField label="Nome Fantasia" name="trade_name" value={formData.trade_name} onChange={handleChange} />
                <InputField label="CNPJ" name="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" />
                <InputField label="Data de Fundação" name="foundation_date" type="date" value={formData.foundation_date} onChange={handleChange} />
                <SelectField label="Situação Cadastral" name="status" value={formData.status} onChange={handleChange} options={["Ativa", "Inativa"]} />
                <InputField label="Denominação / Cobertura Ministerial" name="denomination" value={formData.denomination} onChange={handleChange} />
                <TextareaField label="Propósito ou Lema Institucional" name="purpose" value={formData.purpose} onChange={handleChange} />

                {/* Endereço e Contato */}
                <TextareaField label="Endereço Completo" name="address" value={formData.address} onChange={handleChange} />
                <InputField label="Telefone / WhatsApp" name="phone" value={formData.phone} onChange={handleChange} />
                <InputField label="E-mail Institucional" name="email" type="email" value={formData.email} onChange={handleChange} />
                <InputField label="Site Oficial" name="website" value={formData.website} onChange={handleChange} />
                <InputField label="Redes Sociais" name="social_media" value={formData.social_media} onChange={handleChange} />
            </form>

            <div className="pt-6 flex justify-end">
                <button
                    onClick={saveChurchData}
                    disabled={saving}
                    className={`px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium transition flex items-center gap-2 ${saving ? "opacity-70 cursor-not-allowed" : "hover:bg-teal-700"
                        }`}
                >
                    {saving && <Loader2 className="animate-spin w-4 h-4" />}
                    {saving ? "Salvando..." : "Salvar Alterações"}
                </button>
            </div>
        </>
    );
}
