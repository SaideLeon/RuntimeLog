import React, { useEffect, useState } from 'react';
import { BlogPost } from '../types';
import WindowFrame from './WindowFrame';
import { ArrowLeft, ArrowRight, Clock, Calendar, Hash, Sparkles, Copy, Check, Link as LinkIcon, Quote, Type, Minus, Plus, Heart, Eye } from 'lucide-react';
import { generateArticleContent } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CommentSection from './CommentSection';

interface ArticleViewProps {
  post: BlogPost;
  user: any;
  onAuthRequest: () => void;
  onBack: () => void;
  previousPost?: BlogPost | null;
  nextPost?: BlogPost | null;
  onNavigate?: (post: BlogPost) => void;
  previewMode?: boolean;
}

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language = 'text' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // We keep code blocks dark even in light mode for better readability of code
  return (
    <div className="my-8 border border-gray-200 dark:border-emerald-500/20 rounded-lg overflow-hidden bg-[#1e1e1e] shadow-lg shadow-black/20 dark:shadow-black/50">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0b0e11] border-b border-white/10 dark:border-emerald-500/10">
        <div className="flex gap-2 items-center">
           <div className="flex gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20"></div>
           </div>
           <span className="text-xs font-mono text-gray-500 uppercase ml-2 select-none">{language}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-mono text-gray-500 hover:text-emerald-400 transition-colors"
          title="Copiar para área de transferência"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <SyntaxHighlighter
          language={language.toLowerCase()}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            fontFamily: "'JetBrains Mono', monospace",
          }}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

// Helper for parsing inline markdown styles
const parseInline = (text: string): React.ReactNode[] => {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
  
  return parts.map((part, index) => {
    // Inline Code
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="bg-gray-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200 dark:border-emerald-500/20 mx-0.5">
          {part.slice(1, -1)}
        </code>
      );
    }
    // Bold
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="text-gray-900 dark:text-emerald-100 font-bold">{part.slice(2, -2)}</strong>;
    }
    // Italic
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="text-gray-600 dark:text-gray-300 italic">{part.slice(1, -1)}</em>;
    }
    // Link
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a 
            key={index} 
            href={match[2]} 
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/30 hover:decoration-emerald-500 transition-all" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {match[1]}
          </a>
        );
      }
    }
    return part;
  });
};

const ArticleView: React.FC<ArticleViewProps> = ({ post, user, onAuthRequest, onBack, previousPost, nextPost, onNavigate, previewMode = false }) => {
  const [content, setContent] = useState<string>(post.content || '');
  const [isLoading, setIsLoading] = useState(!post.content);
  
  // Likes State
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // Font Size State
  const [fontSize, setFontSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('articleFontSize');
      return saved ? parseInt(saved, 10) : 1; // Default index 1 is text-lg
    }
    return 1;
  });

  useEffect(() => {
    localStorage.setItem('articleFontSize', fontSize.toString());
  }, [fontSize]);

  // Fetch Likes
  useEffect(() => {
    if (previewMode) return; // Skip fetching likes in preview mode

    const fetchLikes = async () => {
      const { count } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact' })
        .eq('post_id', post.id);
      
      setLikesCount(count || 0);

      if (user) {
        const { data } = await supabase
          .from('post_likes')
          .select('*')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .single();
        
        setHasLiked(!!data);
      } else {
        setHasLiked(false);
      }
    };

    fetchLikes();
  }, [post.id, user, previewMode]);

  const handleLike = async () => {
    if (previewMode) return;

    if (!user) {
      onAuthRequest();
      return;
    }

    if (hasLiked) {
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', user.id);
      setHasLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
      setHasLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  const fontSizes = ['text-base', 'text-lg', 'text-xl', 'text-2xl'];
  const lineHeights = ['leading-7', 'leading-8', 'leading-9', 'leading-10'];
  const currentFontSizeClass = fontSizes[fontSize];
  const currentLineHeightClass = lineHeights[fontSize];

  useEffect(() => {
    if (!content) {
      const fetchContent = async () => {
        setIsLoading(true);
        const generated = await generateArticleContent(post.title, post.excerpt);
        setContent(generated);
        setIsLoading(false);
      };
      fetchContent();
    }
  }, [post, content]);

  const generateId = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let codeBuffer: string[] = [];
    let language = 'text';
    let inCodeBlock = false;
    let paragraphBuffer: string[] = [];
    
    const flushParagraph = () => {
        if (paragraphBuffer.length > 0) {
            const combinedText = paragraphBuffer.join(' ').trim();
            if (combinedText) {
                elements.push(
                    <p key={`p-${elements.length}`} className={`mb-6 text-gray-700 dark:text-gray-300 ${currentLineHeightClass} ${currentFontSizeClass} tracking-normal`}>
                        {parseInline(combinedText)}
                    </p>
                );
            }
            paragraphBuffer = [];
        }
    };

    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        
        // CODE BLOCKS
        if (trimmed.startsWith('```')) {
            if (inCodeBlock) {
                elements.push(<CodeBlock key={`code-${idx}`} code={codeBuffer.join('\n')} language={language} />);
                codeBuffer = [];
                inCodeBlock = false;
            } else {
                flushParagraph();
                inCodeBlock = true;
                const match = trimmed.match(/```(\w+)?/);
                language = match && match[1] ? match[1] : 'text';
            }
            return;
        }

        if (inCodeBlock) {
            codeBuffer.push(line);
            return;
        }

        // H1
        if (line.startsWith('# ')) {
            flushParagraph();
            elements.push(
                <h1 key={`h1-${idx}`} className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 mt-16 mb-8 border-b border-gray-200 dark:border-emerald-500/20 pb-4">
                    {line.replace('# ', '')}
                </h1>
            );
            return;
        }
        
        // H2
        if (line.startsWith('## ')) {
            flushParagraph();
            const text = line.replace('## ', '');
            const id = generateId(text);
            elements.push(
               <div key={`h2-${idx}`} className="group flex items-center gap-3 mt-12 mb-6">
                 <div className="w-1 h-8 bg-emerald-500 rounded-full opacity-70"></div>
                 <h2 id={id} className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {text}
                 </h2>
               </div>
            );
            return;
        }

        // H3
        if (line.startsWith('### ')) {
            flushParagraph();
            elements.push(
                <h3 key={`h3-${idx}`} className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mt-10 mb-4 flex items-center gap-2">
                   <span className="text-emerald-500/50">###</span> {line.replace('### ', '')}
                </h3>
            );
            return;
        }

        // Blockquotes
        if (line.startsWith('> ')) {
             flushParagraph();
             elements.push(
                <blockquote key={`quote-${idx}`} className="my-8 p-6 bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-emerald-500 rounded-r-lg italic text-gray-700 dark:text-gray-300 relative">
                   <Quote className="absolute top-4 right-4 text-emerald-500/20" size={24} />
                   {parseInline(line.replace('> ', ''))}
                </blockquote>
             );
             return;
        }
        
        // List items (basic support)
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            flushParagraph();
            const content = line.trim().substring(2);
            elements.push(
                <li key={`li-${idx}`} className={`ml-6 mb-2 list-disc marker:text-emerald-500 text-gray-700 dark:text-gray-300 ${currentFontSizeClass} pl-2`}>
                   {parseInline(content)}
                </li>
            );
            return;
        }

        // Empty lines trigger flush
        if (trimmed === '') {
            flushParagraph();
            return;
        }

        // Accumulate text
        paragraphBuffer.push(line);
    });

    flushParagraph(); // Final flush
    return elements;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] transition-colors duration-300">
       {/* Progress Bar */}
       <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-200 dark:bg-gray-800">
          <div className="h-full bg-emerald-500" style={{ width: '0%', transition: 'width 0.1s' }} id="reading-progress"></div>
       </div>

       {/* Floating Navigation (Desktop) */}
       <div className="fixed top-24 right-8 z-40 hidden xl:flex flex-col gap-4">
          <div className="bg-white/90 dark:bg-[#0b0e11]/90 backdrop-blur border border-gray-200 dark:border-gray-800 rounded-lg p-2 shadow-xl space-y-2">
             <button onClick={() => setFontSize(Math.min(fontSize + 1, 3))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400" title="Aumentar Fonte"><Plus size={16}/></button>
             <button onClick={() => setFontSize(Math.max(fontSize - 1, 0))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400" title="Diminuir Fonte"><Minus size={16}/></button>
          </div>
          <div className="bg-white/90 dark:bg-[#0b0e11]/90 backdrop-blur border border-gray-200 dark:border-gray-800 rounded-lg p-2 shadow-xl">
             <button onClick={handleLike} className={`p-2 rounded transition-colors ${hasLiked ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'}`}>
                <Heart size={20} fill={hasLiked ? "currentColor" : "none"} />
                <span className="text-xs font-mono block text-center mt-1">{likesCount}</span>
             </button>
          </div>
       </div>

       <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
          {/* Back Button */}
          <button 
            onClick={onBack}
            className="group mb-8 flex items-center gap-2 text-sm font-mono text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            cd ..
          </button>

          <WindowFrame className="shadow-2xl dark:shadow-[0_0_100px_rgba(16,185,129,0.1)] mb-12">
            <div className="bg-white dark:bg-[#0b0e11] min-h-[800px] p-8 md:p-12 relative overflow-hidden">
               {/* Background Watermark */}
               <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Hash size={200} className="text-emerald-500" />
               </div>

               {/* Header */}
               <header className="relative z-10 mb-12 border-b border-gray-100 dark:border-gray-800 pb-12">
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      <Hash size={12} /> {post.category}
                    </span>
                    {post.tags?.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-[10px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8 leading-tight">
                    {post.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-mono">
                     <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {post.date}
                     </div>
                     <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {post.readTime}
                     </div>
                     <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                        <Type size={14} />
                        Markdown
                     </div>
                  </div>
               </header>

               {/* Main Content */}
               <article className="relative z-10 font-sans">
                  {isLoading ? (
                    <div className="space-y-8 animate-pulse">
                       <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                       <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                       <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/6"></div>
                       <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg mt-8"></div>
                       <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mt-8"></div>
                       <div className="flex justify-center mt-12">
                          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-500 font-mono text-sm">
                             <Sparkles className="animate-spin" />
                             Gerando conteúdo via Gemini AI...
                          </div>
                       </div>
                    </div>
                  ) : (
                    renderContent(content)
                  )}
               </article>

               {/* Footer / Author */}
               <div className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[2px]">
                           <div className="w-full h-full rounded-full bg-white dark:bg-[#0b0e11] flex items-center justify-center">
                              <span className="font-bold text-emerald-600 dark:text-emerald-500">RL</span>
                           </div>
                        </div>
                        <div>
                           <p className="text-sm font-bold text-gray-900 dark:text-white">Time Code::Omar</p>
                           <p className="text-xs text-gray-500 font-mono">Conteúdo Gerado pelo Sistema</p>
                        </div>
                     </div>
                     
                     <div className="flex gap-2">
                        <button 
                           onClick={handleLike}
                           className={`p-2 rounded-full transition-colors flex items-center gap-2 border ${hasLiked ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:border-red-500 hover:text-red-500'}`}
                        >
                           <Heart size={18} fill={hasLiked ? "currentColor" : "none"} />
                           <span className="text-xs font-mono font-bold">{likesCount}</span>
                        </button>
                     </div>
                  </div>
               </div>

               {/* Comments */}
               <CommentSection postId={post.id} user={user} onAuthRequest={onAuthRequest} />

            </div>
          </WindowFrame>
          
          {/* Next/Prev Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {previousPost ? (
                <button 
                  onClick={() => onNavigate && onNavigate(previousPost)}
                  className="group p-6 text-left bg-white dark:bg-[#0b0e11] border border-gray-200 dark:border-gray-800 rounded-lg hover:border-emerald-500/50 transition-all"
                >
                   <span className="text-xs font-mono text-gray-400 group-hover:text-emerald-500 flex items-center gap-1 mb-2">
                     <ArrowLeft size={12} /> Anterior
                   </span>
                   <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                     {previousPost.title}
                   </h4>
                </button>
             ) : <div></div>}
             
             {nextPost && (
                <button 
                  onClick={() => onNavigate && onNavigate(nextPost)}
                  className="group p-6 text-right bg-white dark:bg-[#0b0e11] border border-gray-200 dark:border-gray-800 rounded-lg hover:border-emerald-500/50 transition-all"
                >
                   <span className="text-xs font-mono text-gray-400 group-hover:text-emerald-500 flex items-center gap-1 mb-2 justify-end">
                     Próximo <ArrowRight size={12} />
                   </span>
                   <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                     {nextPost.title}
                   </h4>
                </button>
             )}
          </div>
       </div>
    </div>
  );
};

export default ArticleView;