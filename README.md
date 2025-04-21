# Smart Dev Flow Check

> **Este projeto foi criado e evoluído com auxílio da plataforma [Lovable.dev](https://lovable.dev), aproveitando recursos de automação, UI moderna e integração de IA para acelerar o desenvolvimento.**

## Visão Geral

Smart Dev Flow Check é um gerenciador de projetos e tarefas para times de desenvolvimento, com integração a Supabase, interface moderna, suporte a temas, filtros avançados e integração com APIs externas como Calendly.

---

## Principais Funcionalidades
- **Cadastro e autenticação de usuários** (Supabase Auth)
- **Criação, edição e exclusão de projetos**
- **Exclusão de projetos com remoção em cascata de tarefas**
- **Dashboard com busca e filtro avançado (Drawer lateral)**
    - Filtragem por tipo de projeto (Backend, Frontend, Full Stack, Mobile)
    - Filtragem por tecnologias (React, Node.js, TypeScript etc.)
    - Filtros combináveis e integrados à busca textual
- **Checklist de tarefas por projeto**
- **Integração com Calendly** (agendamento de tarefas como eventos)
- **Transição suave de tema (light/dark)**
- **UI baseada em shadcn-ui e Tailwind CSS**

---

## Tecnologias Utilizadas
- **React + Vite + TypeScript**
- **Supabase** (Auth, Database, Functions)
- **shadcn-ui** (componentes acessíveis e modernos)
- **Tailwind CSS**
- **Lucide React** (ícones)
- **Calendly API**
- **Lovable.dev** (plataforma de automação e evolução do projeto)

---

## APIs e Integrações
- **Supabase:** Autenticação, armazenamento de projetos/tarefas, funções serverless (Deno)
- **Calendly:** Criação de eventos a partir de tarefas do checklist
- **Lovable.dev:** Evolução do projeto por prompts, deploy automatizado, integração com IA

---

## Como Executar Localmente

Pré-requisitos:
- Node.js (recomenda-se usar [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm

Passos:
```sh
# 1. Clone o repositório
$ git clone <YOUR_GIT_URL>
$ cd <YOUR_PROJECT_NAME>

# 2. Instale as dependências
$ npm install

# 3. Configure as variáveis de ambiente
$ cp .env.example .env
# Edite .env com as chaves da sua instância Supabase

# 4. Rode o servidor de desenvolvimento
$ npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Observações Importantes
- **Funções Supabase (Deno):**
    - Os arquivos em `supabase/functions` usam imports Deno-style e podem mostrar erros de tipo no VSCode, mas funcionam normalmente no deploy Supabase.
    - Ignore esses avisos ou use o plugin Deno no VSCode se desejar lint local.
- **Integração com Calendly:**
    - Para usar, salve `calendly_access_token` e `calendly_user_uri` no localStorage do navegador.
    - Veja instruções no próprio app e neste README.

---

## Deploy e Evolução
- O projeto pode ser evoluído via [Lovable.dev](https://lovable.dev/projects/92563a14-a969-487f-b372-6bd8ddd79201) por prompts/IA.
- Deploy automatizado via Lovable ou manual via Vercel/Netlify se desejar.

---

## Créditos
Projeto criado por Witor, com apoio da Lovable.dev e recursos modernos de automação e UI.

---

## Links Úteis
- [Lovable Project](https://lovable.dev/projects/92563a14-a969-487f-b372-6bd8ddd79201)
- [Supabase](https://supabase.com/)
- [Calendly API](https://developer.calendly.com/api-docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

> Para dúvidas, sugestões ou contribuir, abra uma issue ou envie um PR!
