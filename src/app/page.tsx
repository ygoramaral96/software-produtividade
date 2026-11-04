import Link from "next/link";
import { ListaTarefas } from "@/components/ListaTarefas";
import { TAREFAS_POR_PAGINA } from "@/lib/constantes";
import { serverApi } from "@/trpc/server";
import styles from "./page.module.css";

// Os dados mudam a cada operação, então a página não pode ser gerada estaticamente no build: é renderizada no servidor a cada requisição (SSR).
export const dynamic = "force-dynamic";

export default async function Home() {
  const paginaInicial = await serverApi.tarefas.listar({
    limit: TAREFAS_POR_PAGINA,
  });

  return (
    <main className={styles.container}>
      <header className={styles.cabecalho}>
        <h1>Tarefas</h1>
        <Link href="/tarefas/nova" className="botao botaoPrimario">
          Nova tarefa
        </Link>
      </header>

      <ListaTarefas paginaInicial={paginaInicial} />
    </main>
  );
}
