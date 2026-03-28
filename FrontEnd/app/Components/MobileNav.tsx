"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--primary)] py-2 z-50">
      <div className="flex justify-around items-center h-12">
        <Link href="/explore" className="flex flex-col items-center justify-center p-2">
          <span
            className={`text-sm ${
              isActive("/explore") ? "font-bold text-white" : "font-medium text-gray-200"
            } hover:text-white transition-opacity`}
          >
            Inicio
          </span>
        </Link>
        <Link href="/agenda" className="flex flex-col items-center justify-center p-2">
          <span
            className={`text-sm ${
              isActive("/agenda") ? "font-bold text-white" : "font-medium text-gray-200"
            } hover:text-white transition-opacity`}
          >
            Agenda
          </span>
        </Link>
        <Link href="/user" className="flex flex-col items-center justify-center p-2">
          <span
            className={`text-sm ${
              isActive("/user") ? "font-bold text-white" : "font-medium text-gray-200"
            } hover:text-white transition-opacity`}
          >
            Perfil
          </span>
        </Link>
      </div>
    </div>
  );
}
