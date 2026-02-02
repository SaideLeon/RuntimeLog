import React, { useEffect, useState } from 'react';
import { BlogPost } from '../types';
import WindowFrame from './WindowFrame';
import { ArrowLeft, Clock, Calendar, Hash, Sparkles, Copy, Check } from 'lucide-react';
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
    <div className="my-6 border border-emerald-500/20 rounded-lg overflow-hidden bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0b0e11] border-b border-emerald-500/10">
        <div className="flex gap-2 items-center">
           <div className="flex gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20"></div>
           </div>
           <span className="text-xs font-mono text-gray-500 uppercase ml-2">{language}</span>
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

  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let currentLanguage = 'text';

    lines.forEach((line, idx) => {
      // Check for code block markers
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // End of block
          elements.push(
            <CodeBlock key={`code-${idx}`} code={codeBuffer.join('\n')} language={currentLanguage} />
          );
          codeBuffer = [];
          inCodeBlock = false;
          currentLanguage = 'text';
        } else {
          // Start of block
          inCodeBlock = true;
          const match = line.trim().match(/```(\w+)?/);
          if (match && match[1]) {
            currentLanguage = match[1];
          } else {
            currentLanguage = 'text';
          }
        }
      } else if (inCodeBlock) {
        codeBuffer.push(line);
      } else {
        // Standard markdown handling
        if (line.startsWith('# ')) {
          elements.push(<h1 key={idx} className="text-3xl font-bold text-emerald-400 mt-10 mb-6 border-b border-emerald-500/20 pb-2">{line.replace('# ', '')}</h1>);
        } else if (line.startsWith('## ')) {
          elements.push(<h2 key={idx} className="text-2xl font-bold text-white mt-8 mb-4">{line.replace('## ', '')}</h2>);
        } else if (line.startsWith('### ')) {
          elements.push(<h3 key={idx} className="text-xl font-bold text-white mt-6 mb-3">{line.replace('### ', '')}</h3>);
        } else if (line.trim().startsWith('- ')) {
           elements.push(<li key={idx} className="ml-4 list-disc text-gray-300 mb-2 pl-2 marker:text-emerald-500">{line.replace('- ', '')}</li>);
        } else if (line.trim() !== '') {
          elements.push(<p key={idx} className="mb-4 text-gray-300 leading-relaxed">{line}</p>);
        }
      }
    });

    // Handle any unclosed code blocks
    if (codeBuffer.length > 0) {
      elements.push(
        <CodeBlock key="code-end" code={codeBuffer.join('\n')} language={currentLanguage} />
      );
    }

    return elements;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span>cd ..</span>
      </button>

      <WindowFrame title={`posts/${post.id}.md`} className="min-h-[80vh]">
        <article className="prose prose-invert prose-emerald max-w-none px-4 md:px-8 py-6">
          <header className="mb-8 border-b border-gray-800 pb-8">
            <div className="flex gap-2 mb-4">
              <span className="text-emerald-500 text-sm font-mono px-2 py-0.5 border border-emerald-500/30 rounded bg-emerald-500/10">
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 font-mono">
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                {post.date}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                {post.readTime}
              </div>
            </div>
          </header>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-emerald-900/20 rounded w-3/4"></div>
              <div className="h-4 bg-emerald-900/20 rounded w-full"></div>
              <div className="h-4 bg-emerald-900/20 rounded w-5/6"></div>
              <div className="h-32 bg-emerald-900/10 rounded w-full border border-emerald-500/10 flex items-center justify-center mt-8">
                 <div className="flex items-center gap-2 text-emerald-500/50">
                    <Sparkles className="animate-spin" size={20} />
                    <span>AI Generating content...</span>
                 </div>
              </div>
            </div>
          ) : (
            <div className="markdown-body">
               {renderContent(content)}
            </div>
          )}

          <footer className="mt-12 pt-8 border-t border-gray-800">
            <h3 className="text-sm font-mono text-gray-500 mb-4 uppercase tracking-widest">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs text-emerald-400/80 bg-emerald-900/20 px-2 py-1 rounded hover:bg-emerald-900/40 transition-colors cursor-pointer">
                  <Hash size={10} />
                  {tag}
                </span>
              ))}
            </div>
          </footer>
        </article>
      </WindowFrame>
    </div>
  );
};

export default ArticleView;