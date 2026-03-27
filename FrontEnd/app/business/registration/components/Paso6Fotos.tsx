import useRegistrationBusiness from "../Hooks/useRegistrationBusiness";
import { FormData } from "../types/registroNegocio";

export default function Paso6Fotos({
  formData,
  handleFotoChange,
  eliminarFoto,
  handleLogoChange,
  setFormData,
}: {
  formData: FormData;
  handleFotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  eliminarFoto: (index: number) => void;
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Fotos del negocio</h2>
        <p className="text-gray-600">Muestra tu espacio a los clientes</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo del negocio
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {formData.logo ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {formData.logo.name}
              </span>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, logo: null }))}
                className="text-red-500 hover:text-red-700"
              >
                Eliminar
              </button>
            </div>
          ) : (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-800"
              >
                Haz clic para subir un logo
              </label>
            </>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fotos del local (máx. 3)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFotoChange}
            className="hidden"
            id="fotos-upload"
          />
          <label
            htmlFor="fotos-upload"
            className="cursor-pointer text-blue-600 hover:text-blue-800 block text-center"
          >
            Haz clic para seleccionar fotos
          </label>

          {formData.fotos.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.fotos.map((foto, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <span className="text-sm text-gray-600">{foto.name}</span>
                  <button
                    type="button"
                    onClick={() => eliminarFoto(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
