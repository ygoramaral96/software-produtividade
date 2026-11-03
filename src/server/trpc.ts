import { initTRPC } from "@trpc/server";
import { ZodError, z } from "zod";

const t = initTRPC.create({
  // Por padrão, um erro do Zod chega ao cliente com a lista de issues serializada como mensagem. 
  // Aqui troquei pela primeira mensagem legível e anexei os erros por campo em `data.zodError`.
  errorFormatter({ shape, error }) {
    const zodError = error.cause instanceof ZodError ? error.cause : null;

    return {
      ...shape,
      message: zodError?.issues[0]?.message ?? shape.message,
      data: {
        ...shape.data,
        zodError: zodError ? z.flattenError(zodError) : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
