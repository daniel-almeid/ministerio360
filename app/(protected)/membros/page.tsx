'use client';

import { useState } from 'react';
import MemberTable from './components/memberTable';
import NewMemberModal from './components/modals/newMember';
import EditMemberModal from './components/modals/editMember';
import DeleteMemberModal from './components/modals/deleteMember';

export default function MembersPage() {
    const [reloadFlag, setReloadFlag] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any>(null);

    const handleReload = () => setReloadFlag(!reloadFlag);

    return (
        <div className="space-y-0.5 pb-0.5">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-700">Membros</h2>
            </div>

            <MemberTable
                reloadFlag={reloadFlag}
                onEdit={(m) => {
                    setSelectedMember(m);
                    setShowEditModal(true);
                }}
                onDelete={(m) => {
                    setSelectedMember(m);
                    setShowDeleteModal(true);
                }}
                onNewClick={() => setShowNewModal(true)}
            />

            {showNewModal && (
                <NewMemberModal
                    onClose={() => setShowNewModal(false)}
                    onSuccess={handleReload}
                />
            )}

            {showEditModal && selectedMember && (
                <EditMemberModal
                    member={selectedMember}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleReload}
                />
            )}

            {showDeleteModal && selectedMember && (
                <DeleteMemberModal
                    member={selectedMember}
                    onClose={() => setShowDeleteModal(false)}
                    onSuccess={handleReload}
                />
            )}
        </div>
    );
}
