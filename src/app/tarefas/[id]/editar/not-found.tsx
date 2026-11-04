import Link from "next/link";
import styles from "../../../page.module.css";

export default function TarefaNaoEncontrada() {
  return (
    <main className={styles.container}>
      <h1 className={styles.tituloPagina}>Tarefa não encontrada</h1>
      <p>A tarefa que você tentou editar não existe ou já foi excluída.</p>
      <p style={{ marginTop: 16 }}>
        <Link href="/" className="botao">
          Voltar para a lista
        </Link>
      </p>
    </main>
  );
}
