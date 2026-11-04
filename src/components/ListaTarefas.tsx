"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/root";
import { trpc } from "@/trpc/client";
import { TAREFAS_POR_PAGINA } from "@/lib/constantes";
import { formatarData } from "@/lib/formatarData";
import { Mensagem, type TipoMensagem } from "./Mensagem";
import styles from "./ListaTarefas.module.css";

type PaginaTarefas = inferRouterOutputs<AppRouter>["tarefas"]["listar"];

type Props = {
  // Primeira página já carregada no servidor (SSR).
  paginaInicial: PaginaTarefas;
};

export function ListaTarefas({ paginaInicial }: Props) {
  const [mensagem, setMensagem] = useState<{
    tipo: TipoMensagem;
    texto: string;
  } | null>(null);

  const utils = trpc.useUtils();

  const consulta = trpc.tarefas.listar.useInfiniteQuery(
    { limit: TAREFAS_POR_PAGINA },
    {
      getNextPageParam: (ultimaPagina) => ultimaPagina.proximoCursor,
      // Usa os dados do SSR como ponto de partida, sem nova requisição ao montar.
      initialData: { pages: [paginaInicial], pageParams: [null] },
    },
  );

  const deletar = trpc.tarefas.deletar.useMutation({
    onSuccess: () => {
      setMensagem({ tipo: "sucesso", texto: "Tarefa excluída com sucesso." });
      return utils.tarefas.listar.invalidate();
    },
    onError: (erro) => {
      setMensagem({ tipo: "erro", texto: erro.message });
    },
  });

  // Infinite scroll: um observer no fim da lista. Quando ele entra na tela, busca a próxima página.
  const infinityScrollRef = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = consulta;

  useEffect(() => {
    const infinityScroll = infinityScrollRef.current;
    if (!infinityScroll || !hasNextPage) return;

    const observer = new IntersectionObserver((entradas) => {
      if (entradas[0].isIntersecting && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(infinityScroll);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const paginas = consulta.data?.pages ?? [];
  const tarefas = paginas.flatMap((pagina) => pagina.itens);
  const total = paginas.at(-1)?.total ?? 0;

  return (
    <section>
      {mensagem && (
        <Mensagem
          tipo={mensagem.tipo}
          texto={mensagem.texto}
          onFechar={() => setMensagem(null)}
        />
      )}

      {tarefas.length > 0 && (
        <p className={styles.contador}>
          Exibindo {tarefas.length} de {total}
        </p>
      )}

      {tarefas.length === 0 ? (
        <p className={styles.vazio}>Nenhuma tarefa cadastrada.</p>
      ) : (
        <ul className={styles.lista}>
          {tarefas.map((tarefa) => {
            const excluindo =
              deletar.isPending && deletar.variables?.id === tarefa.id;

            return (
              <li key={tarefa.id} className={styles.item}>
                <div className={styles.conteudo}>
                  <h2 className={styles.titulo}>{tarefa.titulo}</h2>
                  {tarefa.descricao && <p>{tarefa.descricao}</p>}
                  <small className={styles.data}>
                    Criada em {formatarData(tarefa.dataCriacao)}
                  </small>
                </div>

                <div className={styles.acoes}>
                  <Link href={`/tarefas/${tarefa.id}/editar`} className="botao">
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="botao botaoPerigo"
                    disabled={deletar.isPending}
                    onClick={() => deletar.mutate({ id: tarefa.id })}
                  >
                    {excluindo ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div ref={infinityScrollRef} className={styles.rodape}>
        {isFetchingNextPage && <p>Carregando mais tarefas...</p>}

        {consulta.isFetchNextPageError && (
          <>
            <Mensagem
              tipo="erro"
              texto="Não foi possível carregar mais tarefas."
            />
            <button
              type="button"
              className="botao"
              onClick={() => fetchNextPage()}
            >
              Tentar novamente
            </button>
          </>
        )}

        {!hasNextPage && tarefas.length > 0 && (
          <p>Todas as tarefas foram carregadas.</p>
        )}
      </div>
    </section>
  );
}
