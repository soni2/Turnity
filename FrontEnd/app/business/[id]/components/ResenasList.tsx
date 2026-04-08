import {
  IconStarFilled,
  IconStar,
  IconMessageCircle,
} from "@tabler/icons-react";
import { ResenaInfo } from "../types";

type Props = {
  resenas: ResenaInfo[];
  promedioRating: string;
};

function renderStars(rating: number) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= Math.round(rating) ? (
            <IconStarFilled className="h-4 w-4 md:h-5 md:w-5 text-amber-400 drop-shadow-sm" />
          ) : (
            <IconStar
              className="h-4 w-4 md:h-5 md:w-5 text-gray-300"
              stroke={1.5}
            />
          )}
        </span>
      ))}
    </div>
  );
}

export default function ResenasList({ resenas, promedioRating }: Props) {
  if (!resenas || resenas.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-2xl text-gray-900">
          Reseñas de Clientes
        </h3>
        <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
          <IconStarFilled size={18} className="text-amber-500" />
          <span className="font-bold text-amber-700 text-lg">
            {promedioRating}
          </span>
          <span className="text-amber-600/70 text-sm font-medium tracking-wide">
            ({resenas.length})
          </span>
        </div>
      </div>
      <div className="grid gap-4">
        {resenas.map((res) => (
          <div
            key={res.id}
            className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative"
          >
            <IconMessageCircle
              className="absolute top-4 right-4 text-gray-200"
              size={40}
              stroke={1}
            />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-gray-200 shadow-sm">
                  {res.cliente?.avatar_url ? (
                    <img
                      src={res.cliente.avatar_url}
                      alt={res.cliente.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 bg-gray-100">
                      {res.cliente?.nombre?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-gray-900">
                    {res.cliente?.nombre || "Usuario"}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(res.creado_en).toLocaleDateString("es-DO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                {renderStars(res.rating)}
              </div>
            </div>
            {res.comentario ? (
              <p className="text-gray-700 leading-relaxed text-sm relative z-10 italic">
                &ldquo;{res.comentario}&rdquo;
              </p>
            ) : (
              <p className="text-gray-400 leading-relaxed text-sm relative z-10 italic">
                Sin comentario.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
