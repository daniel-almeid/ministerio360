type Props = {
    form: any;
    setForm: (v: any) => void;
};

export default function ScaleFormFields({ form, setForm }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
                type="date"
                className="border p-2 rounded-lg"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
            />

            <input
                className="border p-2 rounded-lg"
                placeholder="Responsável"
                required
                value={form.responsible}
                onChange={(e) => setForm({ ...form, responsible: e.target.value })}
            />

            <input
                className="border p-2 rounded-lg"
                placeholder="Evento"
                required
                value={form.event}
                onChange={(e) => setForm({ ...form, event: e.target.value })}
            />
        </div>
    );
}
