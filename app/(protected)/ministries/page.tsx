'use client';

import { useState } from 'react';
import MinistryList from './components/ministryTable/ministryTable';
import ModalNewMinistry from './components/modals/newMinistry';
import ModalDeleteMinistry from './components/modals/deleteMinistry';
import ModalEditMinistry from './components/modals/editMinistry';

export default function MinistriesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedMinistry, setSelectedMinistry] = useState<any | null>(null);
    const [reloadFlag, setReloadFlag] = useState(false);

    function handleSuccess() {
        setReloadFlag(!reloadFlag);
        setIsModalOpen(false);
        setIsEditOpen(false);
        setIsDeleteOpen(false);
        setSelectedMinistry(null);
    }

    return (
        <div className="space-y-0.5 pb-0.5">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-700">Ministérios</h2>
            </div>

            <MinistryList
                reloadFlag={reloadFlag}
                onEdit={(m) => {
                    setSelectedMinistry(m);
                    setIsEditOpen(true);
                }}
                onDelete={(m) => {
                    setSelectedMinistry(m);
                    setIsDeleteOpen(true);
                }}
                onNewClick={() => setIsModalOpen(true)}
            />

            {isModalOpen && (
                <ModalNewMinistry
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}

            {isEditOpen && selectedMinistry && (
                <ModalEditMinistry
                    ministry={selectedMinistry}
                    onClose={() => setIsEditOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}

            {isDeleteOpen && selectedMinistry && (
                <ModalDeleteMinistry
                    ministry={selectedMinistry}
                    onClose={() => setIsDeleteOpen(false)}
                    onDeleted={handleSuccess}
                />
            )}
        </div>
    );
}
