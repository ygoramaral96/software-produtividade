import { createCaller } from "@/server/root";

// Usado apenas em Server Components. Chama as procedures diretamente, sem passar por HTTP, 
// mas mantendo a mesma validação do Zod e os mesmos erros.
export const serverApi = createCaller({});
