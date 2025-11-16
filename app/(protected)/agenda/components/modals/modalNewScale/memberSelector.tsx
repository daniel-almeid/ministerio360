type Props = {
    ministries: any[];
    members: any[];
    form: any;
    toggleMember: (ministryId: string, memberId: string) => void;
};

export default function MemberSelector({ ministries, members, form, toggleMember }: Props) {
    return (
        <>
            {form.ministriesSelected.map((id: string) => {
                const ministry = ministries.find((m) => m.id === id);
                const ministryMembers = members.filter((mem: any) => mem.ministry_id === id);
                const selected = form.assignments[id] || [];

                return (
                    <div key={id} className="border-t pt-3">
                        <p className="text-sm font-semibold text-[#319795] mb-2">{ministry?.name}</p>

                        <div className="flex flex-wrap gap-2">
                            {ministryMembers.map((mem: any) => (
                                <button
                                    key={mem.id}
                                    type="button"
                                    onClick={() => toggleMember(id, mem.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs border ${
                                        selected.includes(mem.id)
                                            ? "bg-[#E6FFFA] text-[#285E61] border-[#81E6D9]"
                                            : "border-gray-300 text-gray-600 bg-gray-50"
                                    }`}
                                >
                                    {mem.name}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </>
    );
}
