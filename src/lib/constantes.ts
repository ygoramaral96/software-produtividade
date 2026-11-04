// Fica num módulo neutro (sem "use client") porque é usado tanto pelo Server Component da listagem quanto pelo componente de cliente. 
// Valores importados de um arquivo "use client" chegam ao servidor apenas como referência, não como o valor em si.
export const TAREFAS_POR_PAGINA = 10;
