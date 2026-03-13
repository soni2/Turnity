'use client'


export default function Clients({texto, autor, estrellas}: {texto: string, autor: string, estrellas: number}) {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
            ¿QUÉ DICEN NUESTROS CLIENTES?
          </h2>
          
          <p className="text-lg text-gray-600 text-center mb-12">
            Ellos vivieron la experiencia
          </p>
    
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="text-gray-700 text-lg mb-4 italic">
                  {texto}
                </p>
                
                <p className="font-semibold text-gray-900 mb-2">
                  {autor}
                </p>
                
                <div className="flex text-yellow-400 text-xl">
                  {"⭐".repeat(estrellas)}
                </div>
              </div>
          </div>
        </div>
      );
}