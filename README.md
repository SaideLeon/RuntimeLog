# Runtime::Log ⚡️

> **Status do Sistema:** Online  
> **Tema:** Cyberpunk / Focado em Desenvolvedores  
> **Stack:** React + Supabase + Google Gemini AI

**Runtime::Log** é uma plataforma de blog de alto desempenho projetada especificamente para engenheiros de software. Apresenta uma estética inspirada em terminais, renderização de conteúdo técnico aprofundado e recursos impulsionados por IA para geração de conteúdo e insights de pesquisa.

![Prévia do Projeto](https://placehold.co/800x400/050505/10b981?text=Runtime::Log+Preview)

## 🚀 Recursos

### 🎨 UX/UI
- **Estética Neon/Modo Escuro:** Construído com Tailwind CSS, apresentando glassmorphism, bordas brilhantes e tipografia estilo terminal (`JetBrains Mono`).
- **Design Responsivo:** Totalmente otimizado para mobile, tablet e desktop.
- **Animações:** Transições suaves usando `framer-motion`.

### 📝 Gerenciamento de Conteúdo
- **Suporte a Markdown:** Renderiza texto rico, blocos de código com destaque de sintaxe (`react-syntax-highlighter`) e estilização recursiva.
- **Painel Administrativo:** 
  - Upload de arquivos `.md` via arrastar e soltar.
  - Análise automática de frontmatter YAML.
  - **Gerador de IA:** Rascunhe posts completos de blog usando modelos Google Gemini 3 diretamente do painel de administração.

### 🤖 Integração com IA (Google Gemini)
- **Insights de Pesquisa com IA:** Gera insights técnicos no estilo "Você sabia?" baseados nas consultas de pesquisa do usuário.
- **Geração de Conteúdo:** Gera artigos automaticamente ou preenche conteúdo ausente em rascunhos.

### 👥 Comunidade
- **Autenticação:** Autenticação por Email/Senha via Supabase.
- **Comentários:** Threads aninhadas (estilo Reddit) para discussões técnicas.
- **Curtidas:** Rastreamento de engajamento em tempo real.

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Estado/Efeitos:** React Hooks
- **Backend/DB:** Supabase (PostgreSQL, Auth, Realtime)
- **IA:** Google GenAI SDK (`@google/genai`)
- **Ícones:** Lucide React

## ⚙️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/runtime-log.git
cd runtime-log
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Variáveis de Ambiente
Crie um arquivo `.env` no diretório raiz (ou configure seu ambiente de build) com o seguinte:

```env
# Necessário para recursos de IA
API_KEY=sua_chave_api_google_gemini
```

*Nota: A configuração do Supabase está atualmente localizada em `services/supabaseClient.ts`.*

### 4. Configuração do Banco de Dados (Supabase)
Execute o script SQL fornecido em `supabase_schema.sql` dentro do Editor SQL do seu projeto Supabase. Isso irá:
1. Habilitar extensões UUID.
2. Criar tabelas: `profiles`, `posts`, `comments`, `post_likes`.
3. Configurar políticas de Segurança em Nível de Linha (RLS).
4. Criar gatilhos (triggers) para manipulação de novos usuários.

### 5. Execute a aplicação
```bash
npm start
```

## 📂 Estrutura do Projeto

```text
/
├── components/       # Componentes de UI (Hero, AdminView, ArticleView, etc.)
├── services/         # Clientes de API (Supabase, Gemini)
├── types.ts          # Interfaces TypeScript
├── constants.ts      # Dados estáticos e configurações
├── supabase_schema.sql # Definição do banco de dados
└── App.tsx           # Lógica Principal da Aplicação
```

## 🔐 Acesso Administrativo

Para acessar a rota `/admin`:
1. Registre um novo usuário via interface.
2. Vá para o Editor de Tabelas do Supabase -> tabela `profiles`.
3. Altere a coluna `role` do seu usuário de `user` para `admin`.
4. Atualize a aplicação.

## 📜 Licença

Licença MIT.