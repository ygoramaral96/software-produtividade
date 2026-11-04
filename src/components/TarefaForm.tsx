"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TRPCClientErrorLike } from "@trpc/client";
import { z } from "zod";
import type { AppRouter } from "@/server/root";
import { criarTarefaSchema, type Tarefa } from "@/server/tarefas/schema";
import { trpc } from "@/trpc/client";
import { Mensagem } from "./Mensagem";
import styles from "./TarefaForm.module.css";

type Props = {
  // Sem tarefa = modo criação; com tarefa = modo edição.
  tarefa?: Tarefa;
};

type ErrosCampos = {
  titulo?: string;
  descricao?: string;
};

export function TarefaForm({ tarefa }: Props) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const editando = Boolean(tarefa);

  const [titulo, setTitulo] = useState(tarefa?.titulo ?? "");
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? "");
  const [errosCampos, setErrosCampos] = useState<ErrosCampos>({});
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  // Mesmo tratamento para criar e atualizar: limpa o cache da listagem, volta para ela e informa qual operação deu certo via query string.
  const opcoesMutation = {
    onSuccess: async () => {
      await utils.tarefas.listar.invalidate();
      router.push(`/?sucesso=${editando ? "atualizada" : "criada"}`);
    },
    onError: (erro: TRPCClientErrorLike<AppRouter>) => {
      // Se o backend recusou por validação, mostra o erro no campo correspondente.
      const campos: Record<string, string[] | undefined> | undefined =
        erro.data?.zodError?.fieldErrors;
      if (campos) {
        setErrosCampos({
          titulo: campos.titulo?.[0],
          descricao: campos.descricao?.[0],
        });
      }
      setErroServidor(erro.message);
    },
  };

  const criar = trpc.tarefas.criar.useMutation(opcoesMutation);
  const atualizar = trpc.tarefas.atualizar.useMutation(opcoesMutation);
  const salvando = criar.isPending || atualizar.isPending;

  function handleSubmit(evento: React.SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroServidor(null);

    // Valida no cliente com o mesmo schema do backend, evitando uma requisição que certamente seria recusada.
    const resultado = criarTarefaSchema.safeParse({ titulo, descricao });

    if (!resultado.success) {
      const { fieldErrors } = z.flattenError(resultado.error);
      setErrosCampos({
        titulo: fieldErrors.titulo?.[0],
        descricao: fieldErrors.descricao?.[0],
      });
      return;
    }

    setErrosCampos({});

    if (tarefa) {
      atualizar.mutate({ id: tarefa.id, ...resultado.data });
    } else {
      criar.mutate(resultado.data);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {erroServidor && (
        <Mensagem
          tipo="erro"
          texto={erroServidor}
          onFechar={() => setErroServidor(null)}
        />
      )}

      <div className={styles.campo}>
        <label htmlFor="titulo">Título *</label>
        <input
          id="titulo"
          value={titulo}
          onChange={(e) => {
            setTitulo(e.target.value);
            setErrosCampos((atual) => ({ ...atual, titulo: undefined }));
          }}
          aria-invalid={Boolean(errosCampos.titulo)}
          aria-describedby={errosCampos.titulo ? "erro-titulo" : undefined}
          autoFocus
        />
        {errosCampos.titulo && (
          <span id="erro-titulo" className={styles.erro}>
            {errosCampos.titulo}
          </span>
        )}
      </div>

      <div className={styles.campo}>
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          rows={4}
          value={descricao}
          onChange={(e) => {
            setDescricao(e.target.value);
            setErrosCampos((atual) => ({ ...atual, descricao: undefined }));
          }}
          aria-invalid={Boolean(errosCampos.descricao)}
          aria-describedby={
            errosCampos.descricao ? "erro-descricao" : undefined
          }
        />
        {errosCampos.descricao && (
          <span id="erro-descricao" className={styles.erro}>
            {errosCampos.descricao}
          </span>
        )}
      </div>

      <div className={styles.acoes}>
        <Link href="/" className="botao">
          Cancelar
        </Link>
        <button
          type="submit"
          className="botao botaoPrimario"
          disabled={salvando}
        >
          {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Criar tarefa"}
        </button>
      </div>
    </form>
  );
}
