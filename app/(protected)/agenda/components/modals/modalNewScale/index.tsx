"use client";

import { useScaleForm } from "./useScaleForm";
import ScaleFormFields from "./scaleFormFields";
import MinistrySelector from "./ministrySelector";
import MemberSelector from "./memberSelector";
import SubmitActions from "./submitActions";

type Props = {
    onClose: () => void;
    onSuccess: () => void;
    ministries: any[];
    scaleData?: any;
};

export default function ModalNewScale({
    onClose,
    onSuccess,
    ministries,
    scaleData
}: Props) {
    const {
        form,
        members,
        toggleMinistry,
        toggleMember,
        submit,
        saving
    } = useScaleForm(onSuccess, onClose, scaleData);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            <div className="relative bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6 space-y-6 z-10">
                <h3 className="text-xl font-semibold text-gray-700">
                    {scaleData ? "Editar Escala" : "Nova Escala"}
                </h3>

                <form onSubmit={submit} className="space-y-6">

                    <ScaleFormFields
                        form={form}
                        setForm={form.setForm}
                    />

                    <MinistrySelector
                        ministries={ministries}
                        selected={form.ministriesSelected}
                        toggleMinistry={toggleMinistry}
                    />

                    <MemberSelector
                        ministries={ministries}
                        members={members}
                        form={form}
                        toggleMember={toggleMember}
                    />

                    <SubmitActions saving={saving} onClose={onClose} />
                </form>
            </div>
        </div>
    );
}
