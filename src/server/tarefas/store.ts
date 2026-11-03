import type { AtualizarTarefaInput, CriarTarefaInput, Tarefa } from "./schema";

// Armazenamento em memória.
//
// A lista fica no globalThis porque, em desenvolvimento, o Next fica recarregando os
// módulos a cada alteração de arquivo (HMR). Quando era uma variável comum do
// módulo, as tarefas eram perdidas a cada save.
const globalComTarefas = globalThis as typeof globalThis & {
  __tarefas?: Tarefa[];
};

function gerarTarefasIniciais(): Tarefa[] {
  const agora = Date.now();
  return Array.from({ length: 25 }, (_, i) => ({
    id: crypto.randomUUID(),
    titulo: `Tarefa de exemplo ${i + 1}`,
    descricao: i % 3 === 0 ? undefined : `Descrição da tarefa ${i + 1}`,
    dataCriacao: agora - i * 60_000,
  }));
}

const tarefas = (globalComTarefas.__tarefas ??= gerarTarefasIniciais());

function ordenadas() {
  return [...tarefas].sort((a, b) => b.dataCriacao - a.dataCriacao);
}

export function listarTarefas(offset: number, limit: number) {
  const todas = ordenadas();
  const itens = todas.slice(offset, offset + limit);
  const proximo = offset + limit;

  return {
    itens,
    proximoCursor: proximo < todas.length ? proximo : null,
    total: todas.length,
  };
}

export function buscarTarefa(id: string) {
  return tarefas.find((t) => t.id === id);
}

export function criarTarefa(dados: CriarTarefaInput): Tarefa {
  const tarefa: Tarefa = {
    id: crypto.randomUUID(),
    titulo: dados.titulo,
    descricao: dados.descricao || undefined,
    dataCriacao: Date.now(),
  };
  tarefas.push(tarefa);
  return tarefa;
}

export function atualizarTarefa({ id, ...dados }: AtualizarTarefaInput) {
  const tarefa = buscarTarefa(id);
  if (!tarefa) return undefined;

  tarefa.titulo = dados.titulo;
  tarefa.descricao = dados.descricao || undefined;
  return tarefa;
}

export function removerTarefa(id: string) {
  const indice = tarefas.findIndex((t) => t.id === id);
  if (indice === -1) return false;

  tarefas.splice(indice, 1);
  return true;
}
