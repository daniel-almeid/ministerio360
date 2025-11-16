"use client";

import ModalNewEvent from "../modalNewEvent";
import { EventItem } from "../../../../../types/agenda";

type Props = {
    open: boolean;
    event: EventItem | null;
    onClose: () => void;
    onSuccess: () => void;
};

export default function ModalEditEvent({ open, event, onClose, onSuccess }: Props) {
    if (!open || !event) return null;

    return (
        <ModalNewEvent
            eventData={event}
            onClose={onClose}
            onSuccess={onSuccess}
        />
    );
}
