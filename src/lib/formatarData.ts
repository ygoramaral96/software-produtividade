// O fuso é fixo para que o HTML gerado no servidor (SSR) e o renderizado no navegador mostrem o mesmo horário. 
// Sem isso, se o servidor estiver em UTC, o React acusaria erro de hidratação por diferença de texto.
const formatador = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function formatarData(timestamp: number) {
  return formatador.format(timestamp);
}
