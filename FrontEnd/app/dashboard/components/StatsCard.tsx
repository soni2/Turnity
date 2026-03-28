type Props = {
  title: string;
  value: string;
  change?: string;
};

export default function StatsCard({ title, value, change }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
      {change && (
        <span className="text-xs text-green-500 mt-1 inline-block">
          +{change}%
        </span>
      )}
    </div>
  );
}
