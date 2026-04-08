export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Columna izquierda */}
      <div className="lg:col-span-2 space-y-6">
        {/* Esqueleto de Imagen */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="w-full h-64 md:h-[600px] rounded-3xl bg-gray-200 animate-pulse" />
          <div className="flex gap-3 overflow-x-hidden pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 w-24 sm:h-20 sm:w-28 rounded-2xl bg-gray-200 animate-pulse flex-shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Esqueleto de Info Básica */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="w-full md:w-1/2">
              <div className="w-24 h-6 bg-gray-200 rounded-full animate-pulse mb-3" />
              <div className="w-3/4 h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="w-24 h-12 bg-gray-200 rounded-2xl animate-pulse" />
          </div>
          <div className="space-y-3 mb-8">
            <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse shrink-0" />
                <div className="space-y-2 w-full">
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 md:col-span-2 mt-2 pt-4 border-t border-gray-200/60">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse shrink-0" />
              <div className="space-y-2 w-full">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-48 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Esqueleto de Servicios */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="w-48 h-8 bg-gray-200 rounded-lg animate-pulse mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-gray-100 bg-gray-50 rounded-2xl p-5 flex justify-between items-start"
              >
                <div className="space-y-3 w-1/2">
                  <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="w-24 h-6 bg-gray-200 rounded animate-pulse mt-3" />
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Columna derecha - Esqueleto Reserva */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 border border-gray-100">
          <div className="w-40 h-6 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="space-y-6">
            <div>
              <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl bg-gray-200 animate-pulse"
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="w-40 h-4 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 rounded-xl bg-gray-200 animate-pulse" />
                <div className="h-16 rounded-xl bg-gray-200 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-10 rounded-lg bg-gray-200 animate-pulse"
                  />
                ))}
              </div>
            </div>
            <div className="w-full h-14 bg-gray-200 rounded-2xl animate-pulse mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
