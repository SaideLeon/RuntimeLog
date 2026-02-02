export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  content?: string; // Markdown content
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export type ViewState = 'HOME' | 'ARTICLE' | 'SEARCH';
