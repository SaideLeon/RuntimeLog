import { BlogPost, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'backend', name: 'Backend Arch', description: 'Scalability, Distributed Systems, and Databases' },
  { id: 'frontend', name: 'Frontend Eng', description: 'React internals, State Management, and UI/UX' },
  { id: 'devops', name: 'DevOps & CI/CD', description: 'Infrastructure as Code, Kubernetes, and Observability' },
  { id: 'soft-skills', name: 'Soft Skills', description: 'Career growth, Mentorship, and Leadership' },
  { id: 'ai-ml', name: 'Applied AI', description: 'LLMs, RAG, and integrating AI into apps' },
];

export const INITIAL_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'O Mito do "Código Limpo": Quando a Abstração Vira Dívida',
    excerpt: 'Clean Code é religião para muitos, mas o excesso de DRY pode tornar sua codebase ilegível. Vamos discutir pragmatismo sobre dogmatismo.',
    category: 'Soft Skills',
    readTime: '6 min read',
    date: '2023-10-24',
    tags: ['Best Practices', 'Refactoring', 'Architecture'],
    slug: 'mito-codigo-limpo',
    status: 'published',
    content: `
# O Mito do "Código Limpo"

Todos nós já estivemos lá. Você lê o livro do Uncle Bob, sente a iluminação divina e começa a refatorar cada função para ter no máximo 4 linhas. Uma semana depois, ninguém entende o fluxo de execução.

## A falácia do DRY (Don't Repeat Yourself)

O princípio DRY é valioso, mas a duplicação acidental é muitas vezes preferível à abstração errada.

\`\`\`typescript
// Abstração prematura
function handleUser(u: User, action: string) {
  // 50 if/else cases baseados na action
}
\`\`\`

Às vezes, copiar e colar um bloco de 3 linhas é melhor do que criar uma função genérica que aceita 12 parâmetros opcionais.

## Contexto é Rei

Código limpo não é sobre regras estáticas; é sobre clareza no contexto da equipe atual.
    `
  },
  {
    id: '2',
    title: 'Entendendo o React Fiber: O Que Acontece no Render?',
    excerpt: 'Mergulhando fundo no algoritmo de reconciliação do React. Como a árvore de trabalho assíncrona funciona de verdade.',
    category: 'Frontend Eng',
    readTime: '12 min read',
    date: '2023-10-26',
    tags: ['React', 'Performance', 'Internals'],
    slug: 'entendendo-react-fiber',
    status: 'published',
  },
  {
    id: '3',
    title: 'Kubernetes para Devs: Você Não Precisa Ser SRE',
    excerpt: 'Conceitos fundamentais de K8s que todo desenvolvedor backend deveria saber para parar de dizer "funciona na minha máquina".',
    category: 'DevOps & CI/CD',
    readTime: '8 min read',
    date: '2023-10-28',
    tags: ['K8s', 'Docker', 'Infrastructure'],
    slug: 'kubernetes-para-devs',
    status: 'published',
  },
  {
    id: '4',
    title: 'System Design: Projetando um Clone do Twitter',
    excerpt: 'Um guia passo-a-passo sobre sharding de banco de dados, fan-out on write vs fan-out on load e caching strategies.',
    category: 'Backend Arch',
    readTime: '15 min read',
    date: '2023-10-30',
    tags: ['System Design', 'Scalability', 'Databases'],
    slug: 'system-design-twitter-clone',
    status: 'published',
  },
  {
    id: '5',
    title: 'Rust vs Go: Qual Escolher para Microsserviços em 2024?',
    excerpt: 'Uma análise sem fanatismo. Performance, developer experience e ecossistema. Quando a segurança de memória do Rust vale a pena?',
    category: 'Backend Arch',
    readTime: '10 min read',
    date: '2023-11-02',
    tags: ['Rust', 'Go', 'Microservices'],
    slug: 'rust-vs-go-microservicos',
    status: 'published',
  },
  {
    id: '6',
    title: 'A Arte do Code Review Empático',
    excerpt: 'Como apontar erros sem destruir a confiança do seu colega. Técnicas para reviews mais rápidos e eficientes.',
    category: 'Soft Skills',
    readTime: '5 min read',
    date: '2023-11-05',
    tags: ['Culture', 'Teamwork', 'Communication'],
    slug: 'arte-code-review-empatico',
    status: 'published',
  },
  {
    id: '7',
    title: 'RAG (Retrieval-Augmented Generation) com LangChain',
    excerpt: 'Implementando um chatbot que realmente conhece sua documentação interna. Vetores, embeddings e contexto window.',
    category: 'Applied AI',
    readTime: '14 min read',
    date: '2023-11-08',
    tags: ['AI', 'LLM', 'Python'],
    slug: 'rag-langchain-chatbot',
    status: 'published',
  },
  {
    id: '8',
    title: 'CSS Moderno: Diga Adeus aos Media Queries?',
    excerpt: 'Container Queries, :has(), e subgrid mudaram o jogo. Como criar layouts intrinsecamente responsivos.',
    category: 'Frontend Eng',
    readTime: '7 min read',
    date: '2023-11-10',
    tags: ['CSS', 'Design', 'Responsive'],
    slug: 'css-moderno-container-queries',
    status: 'published',
  },
  {
    id: '9',
    title: 'Monitoramento vs Observabilidade: Qual a Diferença?',
    excerpt: 'Logs, métricas e tracing. Como debugar sistemas distribuídos quando você não sabe o que quebrou.',
    category: 'DevOps & CI/CD',
    readTime: '9 min read',
    date: '2023-11-12',
    tags: ['Observability', 'Tracing', 'Debugging'],
    slug: 'monitoramento-vs-observabilidade',
    status: 'published',
  },
  {
    id: '10',
    title: 'Síndrome do Impostor: O Bug Que Afeta Seniors',
    excerpt: 'Por que quanto mais você sabe, mais sente que não sabe nada. Relatos pessoais e estratégias de enfrentamento.',
    category: 'Soft Skills',
    readTime: '6 min read',
    date: '2023-11-15',
    tags: ['Career', 'Mental Health', 'Growth'],
    slug: 'sindrome-do-impostor',
    status: 'published',
  },
];