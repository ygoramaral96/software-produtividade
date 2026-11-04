# Gerenciador de Tarefas

Aplicação simples de gerenciamento de tarefas feita com **Next.js 15 (App Router)** e **tRPC**. As tarefas ficam em memória no servidor, sem banco de dados.

## Funcionalidades

- Listagem de tarefas renderizada no servidor (SSR)
- Carregamento incremental (infinite scroll) ao rolar a página
- Criação, edição e exclusão de tarefas
- Validação no frontend e no backend com o mesmo schema (Zod)
- Mensagens de sucesso e erro, estados de carregamento e página de tarefa não encontrada

## Tecnologias

- [Next.js 15](https://nextjs.org) + React 19
- [tRPC 11](https://trpc.io) com [TanStack Query 5](https://tanstack.com/query)
- [Zod 4](https://zod.dev) para validação
- TypeScript e CSS Modules

## Como executar

Requisito: Node.js 18.18 ou superior.

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

Para rodar a versão de produção:

```bash
npm run build
npm start
```

Ao iniciar, o servidor cria 25 tarefas de exemplo para facilitar o teste do infinite scroll. Como os dados ficam em memória, eles voltam ao estado inicial sempre que o servidor é reiniciado.

## Estrutura

```
src/
├── server/                    # Backend (roda apenas no servidor)
│   ├── trpc.ts                # Inicialização do tRPC e formatação de erros
│   ├── root.ts                # Router principal e tipo AppRouter
│   └── tarefas/
│       ├── schema.ts          # Schemas Zod e tipo Tarefa
│       ├── store.ts           # Armazenamento em memória
│       └── router.ts          # Procedures do CRUD
├── trpc/
│   ├── client.tsx             # Cliente tRPC + React Query (componentes client)
│   └── server.ts              # Caller para Server Components
├── app/
│   ├── api/trpc/[trpc]/       # Endpoint HTTP do tRPC
│   ├── page.tsx               # Listagem (SSR)
│   └── tarefas/
│       ├── nova/              # Criação
│       └── [id]/editar/       # Edição
├── components/                # ListaTarefas, TarefaForm, Mensagem
└── lib/                       # Constantes e formatação de data
```

## Como funciona

### Backend

O router `tarefas` expõe as seguintes procedures:

| Procedure     | Tipo     | Entrada                              | Erros                        |
| ------------- | -------- | ------------------------------------ | ---------------------------- |
| `listar`      | query    | `{ limit?, cursor? }`                | —                            |
| `buscarPorId` | query    | `{ id }`                             | `NOT_FOUND`                  |
| `criar`       | mutation | `{ titulo, descricao? }`             | `BAD_REQUEST` (validação)    |
| `atualizar`   | mutation | `{ id, titulo, descricao? }`         | `BAD_REQUEST`, `NOT_FOUND`   |
| `deletar`     | mutation | `{ id }`                             | `NOT_FOUND`                  |

Cada tarefa tem `id` (UUID), `titulo`, `descricao` (opcional) e `dataCriacao` (timestamp em milissegundos).

A entrada de cada procedure é validada pelo Zod antes de executar. O `errorFormatter` em `server/trpc.ts` substitui a mensagem padrão do Zod pela primeira mensagem legível e anexa os erros por campo em `data.zodError`.

### Frontend

Existem dois caminhos até o backend, e os dois passam pelo mesmo router:

- **Server Components** (listagem e edição) usam `serverApi`, que chama as procedures diretamente, sem requisição HTTP.
- **Client Components** (lista interativa e formulário) usam os hooks do tRPC, que fazem requisições para `/api/trpc`.

A página inicial busca a primeira página de tarefas no servidor e passa esses dados como `initialData` para o `useInfiniteQuery`. As páginas seguintes são buscadas no cliente quando o fim da lista aparece na tela (`IntersectionObserver`).

## Decisões

- **Lista no `globalThis`**: em desenvolvimento, o Next recarrega os módulos a cada alteração (HMR). Guardar a lista no objeto global evita perder os dados a cada save.
- **Schemas compartilhados**: o formulário valida com o mesmo schema usado pelo backend, assim as regras ficam em um único lugar.
- **Paginação por offset**: suficiente para dados em memória. Após uma exclusão, a lista é recarregada, então não há itens pulados ou duplicados.
- **`force-dynamic` na listagem**: os dados mudam a cada operação, então a página precisa ser gerada a cada requisição, e não no build.
- **Fuso horário fixo na formatação de datas**: garante que servidor e navegador gerem o mesmo texto, evitando erro de hidratação.
- **Sem transformer (superjson)**: as datas são trafegadas como número, então JSON puro é suficiente.

## Limitações

- Os dados são perdidos ao reiniciar o servidor.
- O armazenamento em memória não funciona com múltiplas instâncias (por exemplo, em ambientes serverless), já que cada instância teria a sua própria lista.
