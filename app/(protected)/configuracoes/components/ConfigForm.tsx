"use client";

import { Loader2, Calendar } from "lucide-react";
import { InputField } from "./InputField";
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
        <div className="max-h-[70vh] overflow-y-auto pr-3 custom-scrollbar">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[15px]">
                {/* Dados institucionais */}
                <InputField
                    label="Razão Social"
                    name="corporate_name"
                    value={formData.corporate_name}
                    onChange={handleChange}
                />
                <InputField
                    label="Nome Fantasia"
                    name="trade_name"
                    value={formData.trade_name}
                    onChange={handleChange}
                />
                <InputField
                    label="CNPJ"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    placeholder="00.000.000/0000-00"
                />

                {/* Data de Fundação com ícone */}
                <div className="relative">
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                        Data de Fundação
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            name="foundation_date"
                            value={formData.foundation_date || ""}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 text-gray-700 pr-10 focus:ring-2 focus:ring-[#38B2AC] outline-none"
                        />
                        <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <SelectField
                    label="Situação Cadastral"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={["Ativa", "Inativa"]}
                />
                <InputField
                    label="Denominação / Cobertura Ministerial"
                    name="denomination"
                    value={formData.denomination}
                    onChange={handleChange}
                />
                <TextareaField
                    label="Propósito ou Lema Institucional"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                />

                {/* Endereço e Contato */}
                <TextareaField
                    label="Endereço Completo"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                />
                <InputField
                    label="Telefone / WhatsApp"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                />
                <InputField
                    label="E-mail Institucional"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <InputField
                    label="Site Oficial"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                />
                <InputField
                    label="Redes Sociais"
                    name="social_media"
                    value={formData.social_media}
                    onChange={handleChange}
                />
            </form>

            <div className="pt-4 flex justify-end">
                <button
                    onClick={saveChurchData}
                    disabled={saving}
                    className={`px-5 py-2 bg-teal-600 text-white rounded-lg font-medium transition flex items-center gap-2 ${
                        saving
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:bg-teal-700 shadow-sm"
                    }`}
                >
                    {saving && <Loader2 className="animate-spin w-4 h-4" />}
                    {saving ? "Salvando..." : "Salvar Alterações"}
                </button>
            </div>
        </div>
    );
}
