import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../trpc";
import {
  atualizarTarefaSchema,
  criarTarefaSchema,
  idTarefaSchema,
  listarTarefasSchema,
} from "./schema";
import {
  atualizarTarefa,
  buscarTarefa,
  criarTarefa,
  listarTarefas,
  removerTarefa,
} from "./store";

function naoEncontrada(id: string): never {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: `Tarefa com id "${id}" não encontrada.`,
  });
}

export const tarefasRouter = router({
  listar: publicProcedure
    .input(listarTarefasSchema)
    .query(({ input }) => listarTarefas(input.cursor ?? 0, input.limit)),

  buscarPorId: publicProcedure
    .input(idTarefaSchema)
    .query(({ input }) => buscarTarefa(input.id) ?? naoEncontrada(input.id)),

  criar: publicProcedure
    .input(criarTarefaSchema)
    .mutation(({ input }) => criarTarefa(input)),

  atualizar: publicProcedure
    .input(atualizarTarefaSchema)
    .mutation(({ input }) => atualizarTarefa(input) ?? naoEncontrada(input.id)),

  deletar: publicProcedure.input(idTarefaSchema).mutation(({ input }) => {
    if (!removerTarefa(input.id)) naoEncontrada(input.id);
    return { id: input.id };
  }),
});
