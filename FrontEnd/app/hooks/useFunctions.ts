"use client";

import { useRouter } from "next/navigation";

export const useFunctions = () => {
  const router = useRouter();

  const handleRouter = (path: string) => {
    router.push(path);
  };

  return {
    handleRouter,
  };
};
