import React, { useEffect, useState } from 'react';
import { BlogPost } from '../types';
import WindowFrame from './WindowFrame';
import { ArrowLeft, Clock, Calendar, Hash, Sparkles, Copy, Check, Link as LinkIcon, Quote } from 'lucide-react';
import { generateArticleContent } from '../services/geminiService';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ArticleViewProps {
  post: BlogPost;
  onBack: () => void;
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

  return (
    <div className="my-8 border border-emerald-500/20 rounded-lg overflow-hidden bg-[#1e1e1e] shadow-lg shadow-black/50">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0b0e11] border-b border-emerald-500/10">
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
          title="Copy to clipboard"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
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
  // Regex to capture code, bold, italic, and links
  // Order: Code > Bold > Italic > Link to avoid conflict
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
  
  return parts.map((part, index) => {
    // Inline Code
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="bg-emerald-900/30 text-emerald-300 px-1.5 py-0.5 rounded text-sm font-mono border border-emerald-500/20 mx-0.5">
          {part.slice(1, -1)}
        </code>
      );
    }
    // Bold
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="text-emerald-100 font-bold">{part.slice(2, -2)}</strong>;
    }
    // Italic
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="text-gray-300 italic">{part.slice(1, -1)}</em>;
    }
    // Link
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a 
            key={index} 
            href={match[2]} 
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/30 hover:decoration-emerald-500 transition-all" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {match[1]}
          </a>
        );
      }
    }
    // Plain Text
    return part;
  });
};

const ArticleView: React.FC<ArticleViewProps> = ({ post, onBack }) => {
  const [content, setContent] = useState<string>(post.content || '');
  const [isLoading, setIsLoading] = useState(!post.content);

  useEffect(() => {
    // If content is missing, use Gemini to generate it
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
                    <p key={`p-${elements.length}`} className="mb-6 text-gray-300 leading-8 text-lg font-light tracking-wide">
                        {parseInline(combinedText)}
                    </p>
                );
            }
            paragraphBuffer = [];
        }
    };

    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        
        // Code Block State Handling
        if (trimmed.startsWith('```')) {
            if (inCodeBlock) {
                // End Code Block
                elements.push(<CodeBlock key={`code-${idx}`} code={codeBuffer.join('\n')} language={language} />);
                codeBuffer = [];
                inCodeBlock = false;
            } else {
                // Start Code Block
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

        // --- Block Elements ---

        // Headers
        if (line.startsWith('# ')) {
            flushParagraph();
            elements.push(
                <h1 key={`h1-${idx}`} className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mt-16 mb-8 border-b border-emerald-500/20 pb-4">
                    {line.replace('# ', '')}
                </h1>
            );
            return;
        }
        if (line.startsWith('## ')) {
            flushParagraph();
            const text = line.replace('## ', '');
            const id = generateId(text);
            elements.push(
               <div key={`h2-${idx}`} className="group flex items-center gap-3 mt-12 mb-6">
                 <div className="w-1 h-8 bg-emerald-500 rounded-full opacity-70"></div>
                 <h2 id={id} className="text-2xl md:text-3xl font-bold text-white scroll-mt-24 tracking-tight">{text}</h2>
                 <button 
                    onClick={() => scrollToHeading(id)} 
                    className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 text-emerald-500/50 hover:text-emerald-400 p-2"
                    title="Copy link to section"
                 >
                    <LinkIcon size={20} />
                 </button>
               </div>
            );
            return;
        }
        if (line.startsWith('### ')) {
            flushParagraph();
            const text = line.replace('### ', '');
            const id = generateId(text);
            elements.push(
               <div key={`h3-${idx}`} className="group flex items-center gap-2 mt-8 mb-4">
                 <h3 id={id} className="text-xl font-bold text-emerald-100 scroll-mt-24">{text}</h3>
                 <button onClick={() => scrollToHeading(id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500/40 hover:text-emerald-400 p-1"><LinkIcon size={16} /></button>
               </div>
            );
            return;
        }

        // Blockquote
        if (line.startsWith('> ')) {
            flushParagraph();
            elements.push(
                <div key={`quote-${idx}`} className="relative my-10 pl-8">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-transparent rounded-full opacity-50"></div>
                    <Quote className="absolute -top-4 -left-3 text-emerald-500/20 fill-emerald-500/20" size={32} />
                    <blockquote className="text-gray-400 italic text-lg leading-relaxed">
                        {parseInline(line.replace('> ', ''))}
                    </blockquote>
                </div>
            );
            return;
        }

        // List Items (Unordered)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            flushParagraph();
            elements.push(
                <li key={`li-${idx}`} className="ml-2 md:ml-6 list-none flex items-start gap-4 mb-3 text-gray-300 group">
                    <span className="text-emerald-500 mt-2.5 flex-shrink-0 transition-transform group-hover:scale-125 duration-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                    </span>
                    <span className="leading-7 text-lg">{parseInline(trimmed.substring(2))}</span>
                </li>
            );
            return;
        }
        
        // Numbered List
        if (/^\d+\.\s/.test(trimmed)) {
             flushParagraph();
             const match = trimmed.match(/^(\d+)\.\s(.*)/);
             if (match) {
                 const [_, num, content] = match;
                 elements.push(
                    <div key={`nli-${idx}`} className="ml-2 md:ml-6 flex items-start gap-4 mb-3 text-gray-300">
                        <span className="font-mono text-emerald-500/80 font-bold mt-1 select-none text-sm bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-500/20">{num}.</span>
                        <span className="leading-7 text-lg">{parseInline(content)}</span>
                    </div>
                 );
             }
             return;
        }

        // Horizontal Rule
        if (trimmed === '---' || trimmed === '***') {
            flushParagraph();
            elements.push(
                <div key={`hr-${idx}`} className="my-12 flex items-center justify-center gap-4 opacity-30">
                    <div className="h-px bg-emerald-500 w-full max-w-[100px]"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div className="h-px bg-emerald-500 w-full max-w-[100px]"></div>
                </div>
            );
            return;
        }

        // Empty line -> flush paragraph
        if (trimmed === '') {
            flushParagraph();
            return;
        }

        // Accumulate text for paragraph
        paragraphBuffer.push(line);
    });

    flushParagraph();
    
    // Handle unclosed code block
    if (codeBuffer.length > 0) {
        elements.push(<CodeBlock key="code-end" code={codeBuffer.join('\n')} language={language} />);
    }

    return elements;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-gray-500 hover:text-emerald-400 transition-colors group font-mono text-sm"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span>cd ..</span>
      </button>

      <WindowFrame title={`posts/${post.id}.md`} className="min-h-[80vh] shadow-2xl">
        <article className="px-6 md:px-12 py-10 max-w-none">
          {/* Article Header */}
          <header className="mb-12 border-b border-gray-800/60 pb-10">
            <div className="flex gap-2 mb-6">
              <span className="text-emerald-400 text-xs font-mono px-3 py-1 border border-emerald-500/30 rounded-full bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                {post.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-mono border-t border-dashed border-gray-800 pt-6">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-emerald-600" />
                {post.date}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-emerald-600" />
                {post.readTime}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 Online
              </div>
            </div>
          </header>

          {/* Content Area */}
          {isLoading ? (
            <div className="space-y-8 animate-pulse">
              <div className="h-4 bg-gray-800/50 rounded w-3/4"></div>
              <div className="h-4 bg-gray-800/50 rounded w-full"></div>
              <div className="h-4 bg-gray-800/50 rounded w-5/6"></div>
              <div className="h-64 bg-gray-900/30 rounded-lg border border-gray-800 w-full flex flex-col items-center justify-center gap-4 mt-8">
                 <div className="p-3 bg-emerald-500/10 rounded-full">
                    <Sparkles className="animate-spin text-emerald-500" size={24} />
                 </div>
                 <span className="font-mono text-sm text-gray-500">Generating Neural Content...</span>
              </div>
            </div>
          ) : (
            <div className="min-h-[300px]">
               {renderContent(content)}
            </div>
          )}

          {/* Article Footer */}
          <footer className="mt-16 pt-10 border-t border-gray-800/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-xs font-mono text-gray-500 mb-3 uppercase tracking-widest">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-900/10 border border-emerald-500/10 px-3 py-1.5 rounded-full hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all cursor-pointer">
                        <Hash size={11} />
                        {tag}
                        </span>
                    ))}
                    </div>
                </div>
                <div className="flex gap-4">
                     <button className="text-gray-500 hover:text-white transition-colors text-sm font-mono flex items-center gap-2">
                        Next Post <ArrowLeft className="rotate-180" size={14} />
                     </button>
                </div>
            </div>
          </footer>
        </article>
      </WindowFrame>
    </div>
  );
};

export default ArticleView;