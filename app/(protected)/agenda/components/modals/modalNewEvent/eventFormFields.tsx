type Props = {
    form: any;
    setForm: (v: any) => void;
};

export default function EventFormFields({ form, setForm }: Props) {
    return (
        <div className="grid grid-cols-2 gap-3">
            <input
                className="border p-2 rounded-lg"
                required
                value={form.title}
                onChange={(e) => setForm({ title: e.target.value })}
                placeholder="Título"
            />

            <input
                type="date"
                className="border p-2 rounded-lg"
                required
                value={form.date}
                onChange={(e) => setForm({ date: e.target.value })}
            />

            <input
                type="time"
                className="border p-2 rounded-lg"
                required
                value={form.time}
                onChange={(e) => setForm({ time: e.target.value })}
            />

            <input
                className="border p-2 rounded-lg col-span-full"
                value={form.location}
                onChange={(e) => setForm({ location: e.target.value })}
                placeholder="Local"
            />
        </div>
    );
}
