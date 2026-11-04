import styles from "./Mensagem.module.css";

export type TipoMensagem = "sucesso" | "erro";

type Props = {
  tipo: TipoMensagem;
  texto: string;
  onFechar?: () => void;
};

export function Mensagem({ tipo, texto, onFechar }: Props) {
  return (
    // role="alert" faz leitores de tela anunciarem erros imediatamente.
    <div
      className={`${styles.mensagem} ${styles[tipo]}`}
      role={tipo === "erro" ? "alert" : "status"}
    >
      <span>{texto}</span>
      {onFechar && (
        <button
          type="button"
          className={styles.fechar}
          onClick={onFechar}
          aria-label="Fechar mensagem"
        >
          ×
        </button>
      )}
    </div>
  );
}
