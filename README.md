# Mercado — Lista de Compras

App para organizar a lista de compras do mercado: adicione os itens que estão
faltando em casa com a quantidade desejada, acompanhe o progresso e
compartilhe a lista final por download ou direto no WhatsApp.

## Funcionalidades

- Adicionar itens com nome, quantidade, unidade (un, kg, g, L, ml, pct, cx, dz) e categoria
- Marcar itens como comprados e acompanhar o progresso em tempo real
- Ajustar quantidade direto na lista (+ / −)
- Remover itens ou limpar os já comprados
- Baixar a lista em `.txt`, organizada por categoria
- Compartilhar a lista formatada direto no WhatsApp (`wa.me`)
- Dados salvos automaticamente no navegador (`localStorage`) — sem backend
- Layout inspirado em painéis admin (sidebar + topbar + cards de indicadores), responsivo para celular

## Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) para ícones

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Build de produção

```bash
npm run build
npm run preview
```
