import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { TarefaForm } from "@/components/TarefaForm";
import { serverApi } from "@/trpc/server";
import styles from "../../../page.module.css";

type Props = {
  // No Next 15, params é uma Promise.
  params: Promise<{ id: string }>;
};

async function buscarTarefa(id: string) {
  try {
    return await serverApi.tarefas.buscarPorId({ id });
  } catch (erro) {
    // Tarefa inexistente vira a página 404 desta rota (not-found.tsx).
    if (erro instanceof TRPCError && erro.code === "NOT_FOUND") notFound();
    throw erro;
  }
}

export default async function EditarTarefaPage({ params }: Props) {
  const { id } = await params;
  const tarefa = await buscarTarefa(id);

  return (
    <main className={styles.container}>
      <h1 className={styles.tituloPagina}>Editar tarefa</h1>
      <TarefaForm tarefa={tarefa} />
    </main>
  );
}
