# Runtime::Log ⚡️

> **System Status:** Online  
> **Theme:** Cyberpunk / Dev-focused  
> **Stack:** React + Supabase + Google Gemini AI

**Runtime::Log** is a high-performance blogging platform designed specifically for software engineers. It features a terminal-inspired aesthetic, deep technical content rendering, and AI-powered features for content generation and search insights.

![Project Preview](https://placehold.co/800x400/050505/10b981?text=Runtime::Log+Preview)

## 🚀 Features

### 🎨 UX/UI
- **Neon/Dark Mode Aesthetic:** Built with Tailwind CSS, featuring glassmorphism, glowing borders, and terminal-style typography (`JetBrains Mono`).
- **Responsive Design:** Fully optimized for mobile, tablet, and desktop.
- **Animations:** Smooth transitions using `framer-motion`.

### 📝 Content Management
- **Markdown Support:** Renders rich text, code blocks with syntax highlighting (`react-syntax-highlighter`), and recursive styling.
- **Admin Dashboard:** 
  - Drag-and-drop `.md` file upload.
  - Automatic YAML frontmatter parsing.
  - **AI Generator:** Draft full blog posts using Google Gemini 3 models directly from the admin panel.

### 🤖 AI Integration (Google Gemini)
- **AI Search Insights:** Generates "Did you know?" style technical insights based on user search queries.
- **Content Generation:** Auto-generate articles or fill in missing content for drafts.

### 👥 Community
- **Authentication:** Email/Password authentication via Supabase.
- **Comments:** Nested threading (Reddit-style) for technical discussions.
- **Likes:** Real-time engagement tracking.

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **State/Effects:** React Hooks
- **Backend/DB:** Supabase (PostgreSQL, Auth, Realtime)
- **AI:** Google GenAI SDK (`@google/genai`)
- **Icons:** Lucide React

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/runtime-log.git
cd runtime-log
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (or configure your build environment) with the following:

```env
# Required for AI features
API_KEY=your_google_gemini_api_key
```

*Note: Supabase configuration is currently located in `services/supabaseClient.ts`.*

### 4. Database Setup (Supabase)
Run the SQL script provided in `supabase_schema.sql` inside your Supabase project's SQL Editor. This will:
1. Enable UUID extensions.
2. Create tables: `profiles`, `posts`, `comments`, `post_likes`.
3. Set up Row Level Security (RLS) policies.
4. Create triggers for new user handling.

### 5. Run the application
```bash
npm start
```

## 📂 Project Structure

```text
/
├── components/       # UI Components (Hero, AdminView, ArticleView, etc.)
├── services/         # API Clients (Supabase, Gemini)
├── types.ts          # TypeScript Interfaces
├── constants.ts      # Static data & config
├── supabase_schema.sql # Database definition
└── App.tsx           # Main Application Logic
```

## 🔐 Admin Access

To access the `/admin` route:
1. Sign up a new user via the UI.
2. Go to your Supabase Table Editor -> `profiles` table.
3. Change the `role` column of your user from `user` to `admin`.
4. Refresh the application.

## 📜 License

MIT License.
