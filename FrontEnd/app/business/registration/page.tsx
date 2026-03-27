import { Titles } from "@/app/Components/Titles";
import BusinessForm from "./components/BusinessForm";
import { createClient } from "@/lib/supabase/server";

export default async function RegistroNegocioPage() {
  // if (negocioCreado) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  //       <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
  //         <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
  //           {/* <CheckCircleIcon className="h-10 w-10 text-green-600" /> */}
  //         </div>
  //         <h2 className="text-2xl font-bold mb-4">
  //           ¡Negocio registrado con éxito!
  //         </h2>
  //         <p className="text-gray-600 mb-8">
  //           Hemos recibido tu solicitud. En las próximas 24-48 horas revisaremos
  //           la información y activaremos tu negocio en la plataforma.
  //         </p>
  //         <Link
  //           href="/"
  //           className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
  //         >
  //           Ir al inicio
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          {/* <BuildingStorefrontIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" /> */}
          <Titles className="text-3xl font-bold">Registra tu negocio</Titles>
          <p className="text-gray-600 mt-2">
            Únete a la comunidad y comienza a recibir reservas online
          </p>
        </div>

        {/* Formulario */}
        <BusinessForm />

        {/* Beneficios */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {/* <UserGroupIcon className="h-6 w-6 text-gray-600" /> */}
            </div>
            <h3 className="font-medium mb-1">Más clientes</h3>
            <p className="text-sm text-gray-500">
              Llega a nuevas personas buscando servicios como los tuyos
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {/* <ClockIcon className="h-6 w-6 text-gray-600" /> */}
            </div>
            <h3 className="font-medium mb-1">Gestión de agenda</h3>
            <p className="text-sm text-gray-500">
              Organiza tus citas de manera fácil y eficiente
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {/* <CreditCardIcon className="h-6 w-6 text-gray-600" /> */}
            </div>
            <h3 className="font-medium mb-1">Pagos seguros</h3>
            <p className="text-sm text-gray-500">
              Ofrece múltiples opciones de pago a tus clientes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
