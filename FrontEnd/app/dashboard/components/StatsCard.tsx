import { ReactNode } from "react";

type Props = {
  title: string;
  value: string;
  change?: string;
  icon?: ReactNode;
};

export default function StatsCard({ title, value, change, icon }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {change && (
          <span className="text-xs text-green-500 mt-1 inline-block">+{change}%</span>
        )}
      </div>
      {icon && (
        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">{icon}</div>
      )}
    </div>
  );
}
