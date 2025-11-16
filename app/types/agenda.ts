export type Ministry = {
    id: string;
    name: string;
};

export type Member = {
    id: string;
    name: string;
    ministry_id: string;
};

export type EventMinistry = {
    id: string;
    name: string;
};

export type EventItem = {
    id: string;
    title: string;
    date: string;
    time: string;
    location?: string | null;
    ministries?: EventMinistry[];
};

export type ScaleMinistry = {
    id: string;
    name: string;
};

export type ScaleItem = {
    id: string;
    date: string;
    event: string;
    responsible: string;
    ministries: ScaleMinistry[];
};
