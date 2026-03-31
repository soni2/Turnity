"use client";

import { FormData } from "../types/registroNegocio";

export default function Paso1InfoBasica({
  categorias,
  formData,
  handleChange,
  buttonDisabled,
  setButtonDisabled,
}: {
  categorias: string[];
  formData: FormData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  buttonDisabled: boolean;
  setButtonDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Información básica</h2>
        <p className="text-gray-600">Cuéntanos sobre tu negocio</p>
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre del negocio *
        </label>
        <input
          type="text"
          name="nombreNegocio"
          value={formData.nombreNegocio}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Ej: La Esquina del Flow Barber Shop"
          required
        />
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoría *
        </label>
        <select
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          required
        >
          <option value="">Selecciona una categoría</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción del negocio{" "}
          <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          name="descripcion"
          value={formData.descripcion ?? ""}
          onChange={handleChange}
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
          placeholder="Cuéntale a tus clientes qué hace especial a tu negocio, tu especialidad, años de experiencia..."
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {(formData.descripcion ?? "").length}/500
        </p>
      </div>

      {/* Email y Teléfono */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="negocio@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono *
          </label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="809-555-0123"
            required
          />
        </div>
      </div>

      {/* Sitio web */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sitio web <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <input
          type="url"
          name="sitioWeb"
          value={formData.sitioWeb}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="https://www.ejemplo.com"
        />
      </div>
    </div>
  );
}
