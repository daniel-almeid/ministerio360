"use client";

import { useEventForm } from "./useEventForm";
import EventFormFields from "./eventFormFields";
import MinistrySelector from "./ministrySelector";
import SubmitActions from "./submitActions";

type Props = {
    eventData: any;
    onClose: () => void;
    onSuccess: () => void;
};

export default function ModalNewEvent({ eventData, onClose, onSuccess }: Props) {
    const {
        form,
        Ministries,
        selected,
        toggle,
        submit,
        saving
    } = useEventForm(eventData, onSuccess, onClose);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            <div className="relative bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar p-6 space-y-6 z-10">
                <h3 className="text-xl font-semibold text-gray-700">
                    {eventData ? "Editar Evento" : "Novo Evento"}
                </h3>

                <form onSubmit={submit} className="space-y-6">
                    <EventFormFields form={form} setForm={form.setForm} />

                    <MinistrySelector
                        ministries={Ministries}
                        selected={selected}
                        toggle={toggle}
                    />

                    <SubmitActions saving={saving} onClose={onClose} />
                </form>
            </div>
        </div>
    );
}
