"use client";
import { useState } from "react";
import Image from "next/image";

type Props = {
  imagenes: string[];
  logoUrl: string | null;
  nombre: string;
};

export default function BusinessGallery({ imagenes, logoUrl, nombre }: Props) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (imagenes && imagenes.length > 0) {
    return (
      <div className="flex flex-col gap-3 mb-6">
        {/* Imagen Principal */}
        <div className="relative w-full h-64 md:h-[600px] rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
          <Image
            src={imagenes[activeImageIndex] || imagenes[0]}
            alt={`${nombre} - Imagen destacada`}
            fill
            className="object-cover transition-opacity duration-300 ease-in-out"
            priority
          />
        </div>

        {/* Thumbnails */}
        {imagenes.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x relative z-10">
            {imagenes.map((img: string, idx: number) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveImageIndex(idx)}
                onPointerEnter={() => setActiveImageIndex(idx)}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-20 w-24 sm:h-20 sm:w-28 rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 border-2 transition-all duration-200 snap-center ${
                  activeImageIndex === idx
                    ? "border-[var(--primary)] shadow-md opacity-100 scale-[1.02]"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-300"
                }`}
              >
                <Image
                  src={img}
                  alt={`Miniatura ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (logoUrl) {
    return (
      <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden bg-gray-100 shadow-sm">
        <Image
          src={logoUrl}
          alt={nombre}
          fill
          className="object-contain p-4 hover:scale-105 transition-transform duration-500"
        />
      </div>
    );
  }

  return null;
}
