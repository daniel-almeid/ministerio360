export type FollowupStatus = "pendente" | "em_andamento" | "concluido";

export type Visitor = {
    id: string;
    name: string;
    visit_date: string;
    followup_status: FollowupStatus;
    phone: string | null;
    email: string | null;
    notes: string | null;
    is_member: boolean;
    created_at: string;
    updated_at: string;
};