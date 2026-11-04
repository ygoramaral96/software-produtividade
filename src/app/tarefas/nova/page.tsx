import { TarefaForm } from "@/components/TarefaForm";
import styles from "../../page.module.css";

export default function NovaTarefaPage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.tituloPagina}>Nova tarefa</h1>
      <TarefaForm />
    </main>
  );
}
