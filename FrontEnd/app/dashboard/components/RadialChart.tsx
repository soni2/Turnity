"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Barbería", value: 400 },
  { name: "Spa", value: 300 },
  { name: "Salón", value: 300 },
];

export default function RadialChart() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-75">
      <h3 className="font-semibold mb-4">Distribución de ingresos</h3>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
