import { z } from "zod";

// Schemas compartilhados entre backend (validação das procedures)
// e frontend (validação do formulário antes do envio).

export const tituloSchema = z
  .string()
  .trim()
  .min(1, "O título é obrigatório.")
  .max(120, "O título deve ter no máximo 120 caracteres.");

export const descricaoSchema = z
  .string()
  .trim()
  .max(1000, "A descrição deve ter no máximo 1000 caracteres.")
  .optional();

export const criarTarefaSchema = z.object({
  titulo: tituloSchema,
  descricao: descricaoSchema,
});

export const atualizarTarefaSchema = criarTarefaSchema.extend({
  id: z.string().min(1),
});

export const idTarefaSchema = z.object({
  id: z.string().min(1),
});

// O cursor é o offset na lista ordenada. Ao excluir uma tarefa o cliente refaz a consulta, 
// então o deslocamento causado pela remoção não é um problema.
export const listarTarefasSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
  cursor: z.number().int().min(0).nullish(),
});

export type CriarTarefaInput = z.infer<typeof criarTarefaSchema>;
export type AtualizarTarefaInput = z.infer<typeof atualizarTarefaSchema>;

export type Tarefa = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: number; // timestamp em milissegundos
};
