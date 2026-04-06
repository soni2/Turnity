"use client";
import { IconLockFilled } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function NoAuth() {
  const router = useRouter();

  setTimeout(() => {
    router.push("/explore");
  }, 6000);

  return (
    <div className="min-h-screen bg-gray-50 pt-[64px] min-w-dvh flex flex-col items-center justify-center gap-8">
      <IconLockFilled width={250} height={250} className="text-gray-400" />
      <div className="text-3xl font-bold text-gray-400">No autorizado</div>
    </div>
  );
}
