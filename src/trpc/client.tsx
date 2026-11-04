"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import type { AppRouter } from "@/server/root";

// Cliente tipado: trpc.tarefas.listar.useQuery(), trpc.tarefas.criar.useMutation(), etc.
export const trpc = createTRPCReact<AppRouter>();

// Componentes "use client" também são renderizados no servidor durante o SSR.
// Lá não existe URL relativa, então é preciso montar o endereço completo.
function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  // useState garante uma única instância por usuário/aba, sem recriar a cada render.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Evita refazer no cliente a busca que acabou de vir pronta do servidor.
            staleTime: 30_000,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: `${getBaseUrl()}/api/trpc` })],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
