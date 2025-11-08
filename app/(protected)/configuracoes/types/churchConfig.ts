export type ChurchFormData = {
    corporate_name: string;
    trade_name: string;
    cnpj: string;
    foundation_date: string;
    status: "Ativa" | "Inativa";
    denomination: string;
    purpose: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    social_media: string;
};

export const INITIAL_FORM: ChurchFormData = {
    corporate_name: "",
    trade_name: "",
    cnpj: "",
    foundation_date: "",
    status: "Ativa",
    denomination: "",
    purpose: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    social_media: "",
};
