import { Suspense } from "react";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg bg-red-50 p-8 text-center">
        <h1 className="mb-4 text-2xl font-bold text-red-600">
          Error de autenticación
        </h1>
        <p className="text-red-500">
          {(await searchParams).message || "Ocurrió un error al autenticarte"}
        </p>
        <a
          href="/login"
          className="mt-4 inline-block rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Volver a intentar
        </a>
      </div>
    </div>
  );
}
