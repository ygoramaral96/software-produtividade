import { createCallerFactory, router } from "./trpc";
import { tarefasRouter } from "./tarefas/router";

export const appRouter = router({
  tarefas: tarefasRouter,
});

// Apenas o tipo é importado pelo frontend; nenhum código do servidor vai para o bundle do cliente.
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
