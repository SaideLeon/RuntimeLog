export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  subcategory?: string; // Added optional subcategory
  readTime: string; // Mapped from 'read_time' in DB
  date: string;     // Mapped from 'created_at' or 'published_at'
  content?: string; // Markdown content
  tags: string[];
  slug: string;     // Added slug
  status: 'draft' | 'published';
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export type ViewState = 'HOME' | 'ARTICLE' | 'SEARCH' | 'SUBSCRIBE' | 'ABOUT' | 'ADMIN';

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  role: 'user' | 'admin';
}