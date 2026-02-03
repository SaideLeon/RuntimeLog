import { BlogPost, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'backend', name: 'Arq. Backend', description: 'Escalabilidade, Sistemas Distribuídos e Banco de Dados' },
  { id: 'frontend', name: 'Eng. Frontend', description: 'Internals do React, Gerenciamento de Estado e UI/UX' },
  { id: 'devops', name: 'DevOps & CI/CD', description: 'Infraestrutura como Código, Kubernetes e Observabilidade' },
  { id: 'soft-skills', name: 'Soft Skills', description: 'Crescimento de carreira, Mentoria e Liderança' },
  { id: 'ai-ml', name: 'IA Aplicada', description: 'LLMs, RAG e integração de IA em apps' },
];

export const INITIAL_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'O Mito do "Código Limpo": Quando a Abstração Vira Dívida',
    excerpt: 'Clean Code é religião para muitos, mas o excesso de DRY pode tornar sua codebase ilegível. Vamos discutir pragmatismo sobre dogmatismo.',
    category: 'Soft Skills',
    readTime: '6 min leitura',
    date: '24/10/2023',
    tags: ['Boas Práticas', 'Refatoração', 'Arquitetura'],
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
    category: 'Eng. Frontend',
    readTime: '12 min leitura',
    date: '26/10/2023',
    tags: ['React', 'Performance', 'Internals'],
    slug: 'entendendo-react-fiber',
    status: 'published',
  },
  {
    id: '3',
    title: 'Kubernetes para Devs: Você Não Precisa Ser SRE',
    excerpt: 'Conceitos fundamentais de K8s que todo desenvolvedor backend deveria saber para parar de dizer "funciona na minha máquina".',
    category: 'DevOps & CI/CD',
    readTime: '8 min leitura',
    date: '28/10/2023',
    tags: ['K8s', 'Docker', 'Infraestrutura'],
    slug: 'kubernetes-para-devs',
    status: 'published',
  },
  {
    id: '4',
    title: 'System Design: Projetando um Clone do Twitter',
    excerpt: 'Um guia passo-a-passo sobre sharding de banco de dados, fan-out on write vs fan-out on load e caching strategies.',
    category: 'Arq. Backend',
    readTime: '15 min leitura',
    date: '30/10/2023',
    tags: ['System Design', 'Escalabilidade', 'Bancos de Dados'],
    slug: 'system-design-twitter-clone',
    status: 'published',
  },
  {
    id: '5',
    title: 'Rust vs Go: Qual Escolher para Microsserviços em 2024?',
    excerpt: 'Uma análise sem fanatismo. Performance, developer experience e ecossistema. Quando a segurança de memória do Rust vale a pena?',
    category: 'Arq. Backend',
    readTime: '10 min leitura',
    date: '02/11/2023',
    tags: ['Rust', 'Go', 'Microsserviços'],
    slug: 'rust-vs-go-microservicos',
    status: 'published',
  },
  {
    id: '6',
    title: 'A Arte do Code Review Empático',
    excerpt: 'Como apontar erros sem destruir a confiança do seu colega. Técnicas para reviews mais rápidos e eficientes.',
    category: 'Soft Skills',
    readTime: '5 min leitura',
    date: '05/11/2023',
    tags: ['Cultura', 'Trabalho em Equipe', 'Comunicação'],
    slug: 'arte-code-review-empatico',
    status: 'published',
  },
  {
    id: '7',
    title: 'RAG (Retrieval-Augmented Generation) com LangChain',
    excerpt: 'Implementando um chatbot que realmente conhece sua documentação interna. Vetores, embeddings e contexto window.',
    category: 'IA Aplicada',
    readTime: '14 min leitura',
    date: '08/11/2023',
    tags: ['IA', 'LLM', 'Python'],
    slug: 'rag-langchain-chatbot',
    status: 'published',
  },
  {
    id: '8',
    title: 'CSS Moderno: Diga Adeus aos Media Queries?',
    excerpt: 'Container Queries, :has(), e subgrid mudaram o jogo. Como criar layouts intrinsecamente responsivos.',
    category: 'Eng. Frontend',
    readTime: '7 min leitura',
    date: '10/11/2023',
    tags: ['CSS', 'Design', 'Responsividade'],
    slug: 'css-moderno-container-queries',
    status: 'published',
  },
  {
    id: '9',
    title: 'Monitoramento vs Observabilidade: Qual a Diferença?',
    excerpt: 'Logs, métricas e tracing. Como debugar sistemas distribuídos quando você não sabe o que quebrou.',
    category: 'DevOps & CI/CD',
    readTime: '9 min leitura',
    date: '12/11/2023',
    tags: ['Observabilidade', 'Tracing', 'Debugging'],
    slug: 'monitoramento-vs-observabilidade',
    status: 'published',
  },
  {
    id: '10',
    title: 'Síndrome do Impostor: O Bug Que Afeta Seniors',
    excerpt: 'Por que quanto mais você sabe, mais sente que não sabe nada. Relatos pessoais e estratégias de enfrentamento.',
    category: 'Soft Skills',
    readTime: '6 min leitura',
    date: '15/11/2023',
    tags: ['Carreira', 'Saúde Mental', 'Crescimento'],
    slug: 'sindrome-do-impostor',
    status: 'published',
  },
  {
    id: '11',
    title: 'Escalando Django: Otimizações para Alta Performance',
    excerpt: 'Django é lento? Não se você souber usar. Caching avançado, queries otimizadas com select_related e uso de Celery.',
    category: 'Arq. Backend',
    readTime: '11 min leitura',
    date: '18/11/2023',
    tags: ['Python', 'Django', 'Backend', 'Performance'],
    slug: 'escalando-django-performance',
    status: 'published',
  },
];