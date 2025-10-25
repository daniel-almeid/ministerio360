interface CardMetricProps {
  title: string;
  value: string | number;
  color?: string;
}

export function CardMetric({ title, value, color = "#38B2AC" }: CardMetricProps) {
  return (
    <div
      className="rounded-2xl p-5 shadow-md bg-white border border-gray-100 flex flex-col"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <span className="text-sm text-gray-500">{title}</span>
      <strong className="text-2xl font-bold mt-1 text-gray-700">{value}</strong>
    </div>
  );
}
