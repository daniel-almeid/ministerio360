type Props = {
    ministries: any[];
    selected: string[];
    toggleMinistry: (id: string) => void;
};

export default function MinistrySelector({ ministries, selected, toggleMinistry }: Props) {
    return (
        <div className="flex flex-wrap gap-2">
            {ministries.map((m) => (
                <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMinistry(m.id)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${selected.includes(m.id)
                            ? "bg-[#38B2AC] text-white border-[#38B2AC]"
                            : "border-gray-300 text-gray-600"
                        }`}
                >
                    {m.name}
                </button>
            ))}
        </div>
    );
}
