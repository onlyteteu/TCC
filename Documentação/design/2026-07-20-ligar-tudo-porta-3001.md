# LIGAR-TUDO com frontend fixo na porta 3001

## Contexto

A porta local `3000` está ocupada por outro serviço (Metabase). O launcher atual depende dessa
porta e pode deixar o usuário sem uma instância válida da plataforma. Além disso, o processo do
Next.js precisa herdar a URL completa do backend, incluindo o prefixo `/api`.

## Decisão aprovada

- Django permanece em `http://127.0.0.1:8000`.
- Next.js passa a usar sempre `http://127.0.0.1:3001`.
- O frontend recebe `BACKEND_API_BASE_URL=http://127.0.0.1:8000/api` no mesmo processo que inicia
  o Node.js.
- O launcher encerra somente instâncias anteriores do Next.js deste repositório na porta `3001`.
- O cache `.next` só é removido depois que a instância anterior do projeto tiver sido encerrada.
- O navegador abre `/` na porta `3001` somente depois de frontend e backend responderem.
- Se `3001` pertencer a outro programa, o launcher informa o conflito e não encerra esse processo.

## Critério de aceite

Ao executar `LIGAR-TUDO.cmd`, PostgreSQL, Django e Next.js ficam disponíveis, respectivamente, nas
portas `5432`, `8000` e `3001`. A rota de saúde do backend e a página do frontend respondem `200`,
e chamadas do proxy do Next.js chegam ao Django sob `/api`.
