# Runtime::Log ⚡️

> **Status do Sistema:** Online  
> **Tema:** Cyberpunk / Focado em Desenvolvedores  
> **Stack:** React + Supabase + Google Gemini AI + Node.js Server

**Runtime::Log** é uma plataforma de blog de alto desempenho projetada especificamente para engenheiros de software. Apresenta uma estética inspirada em terminais, renderização de conteúdo técnico aprofundado e recursos impulsionados por IA.

## 🚀 Recursos

### 🎨 UX/UI
- **Estética Neon/Modo Escuro:** Construído com Tailwind CSS.
- **Design Responsivo:** Totalmente otimizado para mobile, tablet e desktop.

### 📝 Conteúdo & IA
- **Suporte a Markdown:** Renderiza texto rico e blocos de código.
- **Integração Gemini AI:** Gera insights de pesquisa e rascunhos de artigos.

## 🛠 Instalação e Configuração

### 1. Instale as dependências
```bash
npm install
```

### 2. Configuração de Ambiente (.env)
Seguindo o padrão **Vite**, as variáveis de ambiente devem começar com `VITE_`.

1. Renomeie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
2. Abra o arquivo `.env` e adicione sua chave:
   ```env
   VITE_API_KEY=sua_chave_api_google_aqui
   ```

### 3. Execute a aplicação
```bash
npm start
```
Acesse em `http://localhost:3000`.

## 📂 Estrutura

- **Frontend:** React (via ES Modules/esm.sh) no `index.html` e `src/`.
- **Backend:** `server.js` (Express) serve o frontend e injeta a `VITE_API_KEY`.
- **Config:** `services/config.ts` unifica o acesso via `import.meta.env` e polyfill.

## 🔐 Licença

Licença MIT.