"use client";
import useRegistrationBusiness from "../Hooks/useRegistrationBusiness";

export default function ProgressBar({ paso }: { paso: number }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Paso {paso} de 6
        </span>
        <span className="text-sm text-gray-500">
          {Math.round((paso / 6) * 100)}% completado
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-[var(--primary)] h-2 rounded-full transition-all duration-300"
          style={{ width: `${(paso / 6) * 100}%` }}
        />
      </div>
    </div>
  );
}
