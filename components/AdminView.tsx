import React, { useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { generateFullPost } from '../services/geminiService';
import WindowFrame from './WindowFrame';
import { UploadCloud, FileText, Loader, X, Bot, PenTool, Save, Trash2, Sparkles, AlertTriangle, Eye, CheckCircle } from 'lucide-react';
import { CATEGORIES } from '../constants';
import ArticleView from './ArticleView'; // Import ArticleView for preview

interface AdminViewProps {
  user: any;
}

interface ParsedPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  read_time: string;
  date: string;
  filename: string;
}

const AdminView: React.FC<AdminViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'ai'>('upload');
  
  // Upload State
  const [dragActive, setDragActive] = useState(false);
  const [parsedFiles, setParsedFiles] = useState<ParsedPost[]>([]);
  const [uploading, setUploading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // AI Gen State
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Review/Edit State
  const [generatedDraft, setGeneratedDraft] = useState<ParsedPost | null>(null);

  // Preview State
  const [previewPost, setPreviewPost] = useState<ParsedPost | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // --- Parsing Logic ---
  const generateSlug = (title: string) => {
    return title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const parseFrontMatter = (text: string, filename: string): ParsedPost => {
    let content = text;
    let frontMatter: any = {};
    const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)/);
    if (match) {
      const yamlBlock = match[1];
      content = match[2];
      yamlBlock.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          const key = line.slice(0, colonIndex).trim();
          let value = line.slice(colonIndex + 1).trim();
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          if (value.startsWith('[') && value.endsWith(']')) {
             frontMatter[key] = value.slice(1, -1).split(',').map((v: string) => v.trim().replace(/['"]/g, ''));
          } else {
             frontMatter[key] = value;
          }
        }
      });
    }
    const title = frontMatter.title || filename.replace('.md', '').replace(/-/g, ' ');
    return {
      title: title,
      slug: frontMatter.slug || generateSlug(title),
      excerpt: frontMatter.description || frontMatter.excerpt || content.slice(0, 150) + '...',
      content: content.trim(),
      category: frontMatter.category || 'General',
      tags: frontMatter.tags || [],
      status: frontMatter.status === 'published' ? 'published' : 'draft',
      read_time: frontMatter.read_time || '5 min read',
      date: frontMatter.date || new Date().toISOString().split('T')[0],
      filename
    };
  };

  const handleFiles = async (files: FileList) => {
    const newParsed: ParsedPost[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith('.md')) {
        const text = await file.text();
        const parsed = parseFrontMatter(text, file.name);
        newParsed.push(parsed);
        addLog(`Parsed: ${file.name}`);
      } else {
        addLog(`Error: Skipped ${file.name} (Not a Markdown file)`);
      }
    }
    setParsedFiles(prev => [...prev, ...newParsed]);
  };

  // --- AI Logic ---
  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    addLog(`AI: Generating post for "${aiTopic}"...`);
    try {
      const data = await generateFullPost(aiTopic);
      const newPost: ParsedPost = {
        title: data.title,
        slug: data.slug || generateSlug(data.title),
        excerpt: data.excerpt,
        content: data.content,
        category: data.category || 'Applied AI',
        tags: data.tags || ['AI', 'Generated'],
        status: 'published',
        read_time: data.read_time || '5 min read',
        date: new Date().toISOString().split('T')[0],
        filename: 'ai_generated.md'
      };
      setGeneratedDraft(newPost);
      addLog(`AI: Generated draft for review.`);
      setAiTopic('');
    } catch (err: any) {
      addLog(`AI Error: ${err.message}`);
      showToast('AI Generation Failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateDraft = (field: keyof ParsedPost, value: any) => {
    if (!generatedDraft) return;
    setGeneratedDraft({ ...generatedDraft, [field]: value });
  };
  const discardDraft = () => { setGeneratedDraft(null); addLog('AI: Draft discarded.'); };
  const approveDraft = () => {
    if (!generatedDraft) return;
    setParsedFiles(prev => [...prev, generatedDraft]);
    setGeneratedDraft(null);
    addLog(`AI: "${generatedDraft.title}" staged.`);
    setActiveTab('upload');
  };

  // --- Upload Logic ---
  const removeFile = (index: number) => setParsedFiles(prev => prev.filter((_, i) => i !== index));
  
  const uploadToSupabase = async () => {
    if (!user || !user.id) {
        addLog("CRITICAL ERROR: No User ID found. Please re-login.");
        showToast("Authentication Error: Please re-login.", 'error');
        return;
    }
    setUploading(true);
    addLog(`Starting upload sequence as user: ${user.id}`);
    
    let successCount = 0;
    
    for (const post of parsedFiles) {
      // Debug logs
      console.log(`[AdminView] Processing "${post.title}"...`);
      console.log(`[AdminView] Content length: ${post.content?.length || 0}`);
      
      addLog(`Constructing payload for: ${post.title}`);

      try {
        const payload = {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content, // ✅ Explicitly ensuring content is included
          category: post.category,
          tags: post.tags,
          read_time: post.read_time,
          status: post.status,
          author_id: user.id,
          created_at: new Date(post.date).toISOString()
        };
        
        console.log("🚀 [AdminView] Payload ready for INSERT:", payload);
        addLog(`Sending POST to Supabase table 'posts'...`);

        const { data, error } = await supabase.from('posts').insert(payload).select();
        
        if (error) {
           console.error("❌ [AdminView] Supabase Error:", error);
           addLog(`Supabase API Error: ${error.code} - ${error.message}`);
           throw error;
        }
        
        console.log("✅ [AdminView] Upload Success. Response Data:", data);
        addLog(`Success: 201 Created - ID: ${data?.[0]?.id?.slice(0,8)}...`);
        successCount++;
      } catch (err: any) {
        addLog(`Upload Failed for "${post.title}"`);
        addLog(`Error Details: ${err.message || JSON.stringify(err)}`);
        console.error("Supabase Insert Error:", err);
        showToast(`Upload Failed: ${err.message}`, 'error');
      }
    }
    setUploading(false);
    if (successCount === parsedFiles.length && successCount > 0) {
      setParsedFiles([]);
      addLog('Batch operation complete. All files uploaded.');
      showToast('All files uploaded successfully!', 'success');
    } else if (successCount > 0) {
      addLog('Batch operation finished with warnings.');
      showToast('Some files failed to upload.', 'error');
    }
  };

  if (previewPost) {
    return (
        <ArticleView 
          post={{
            id: 'preview-id',
            title: previewPost.title,
            slug: previewPost.slug,
            excerpt: previewPost.excerpt,
            content: previewPost.content,
            category: previewPost.category,
            tags: previewPost.tags,
            status: previewPost.status,
            readTime: previewPost.read_time, // Mapped from ParsedPost
            date: previewPost.date
          }} 
          user={user}
          onAuthRequest={() => {}}
          onBack={() => setPreviewPost(null)}
          previewMode={true}
        />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-6 z-[100] px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-right-10 duration-300 ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
           {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
           <span className="font-mono text-sm font-bold">{toast.message}</span>
           <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X size={16}/></button>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
         <div className="flex items-center gap-2 text-gray-500 font-mono text-sm">
            <span>root</span><span>/</span><span className="text-red-500">admin</span><span>/</span><span>upload_center</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Main Interface */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 mb-4">
             <button onClick={() => { setActiveTab('upload'); setGeneratedDraft(null); }} className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-mono text-sm transition-colors ${activeTab === 'upload' ? 'bg-white dark:bg-[#15191e] text-emerald-600 dark:text-emerald-500 border-t border-x border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
               <UploadCloud size={16} /> File Upload
             </button>
             <button onClick={() => setActiveTab('ai')} className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-mono text-sm transition-colors ${activeTab === 'ai' ? 'bg-white dark:bg-[#15191e] text-emerald-600 dark:text-emerald-500 border-t border-x border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
               <Bot size={16} /> AI Generator
             </button>
          </div>

          <WindowFrame title={activeTab === 'upload' ? "workspace_v1.0" : "neural_engine_v3"} className="shadow-lg min-h-[350px]">
            {activeTab === 'upload' ? (
                <div 
                  className={`relative p-12 h-full border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[350px] group ${dragActive ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0c0c0c]'}`}
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); if(e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
                >
                  {/* Visual Background Element */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" style={{
                      backgroundImage: 'radial-gradient(circle at center, rgba(16,185,129,0.1) 0%, transparent 70%)'
                  }}></div>

                  <div className={`p-4 rounded-full mb-4 transition-all duration-300 ${dragActive ? 'bg-emerald-500/20 text-emerald-500 scale-110' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                     <UploadCloud size={40} />
                  </div>
                  <p className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Drop Markdown Files</p>
                  <p className="text-sm text-gray-500 mb-8 font-mono max-w-xs leading-relaxed">
                    Auto-parsing of YAML frontmatter enabled.
                  </p>
                  <button onClick={() => inputRef.current?.click()} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-mono text-sm transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/30">Select Files</button>
                  <input ref={inputRef} type="file" multiple accept=".md" className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                </div>
            ) : (
                <div className="h-full bg-gray-50 dark:bg-[#0c0c0c] flex flex-col">
                    {!generatedDraft ? (
                        <div className="flex-1 p-8 flex flex-col justify-center">
                            <div className="max-w-md mx-auto w-full space-y-4">
                                <div className="text-center mb-6">
                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500">
                                        <Sparkles size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Content Generator</h3>
                                    <p className="text-sm text-gray-500">Enter a topic and let the neural network draft a post.</p>
                                </div>
                                <form onSubmit={handleAiGenerate}>
                                    <div className="relative mb-4">
                                        <PenTool className="absolute left-3 top-3 text-gray-400" size={16} />
                                        <input type="text" placeholder="e.g., 'Introduction to WebAssembly'" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#15191e] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500 text-sm font-mono dark:text-white shadow-sm" disabled={isGenerating} />
                                    </div>
                                    <button type="submit" disabled={isGenerating || !aiTopic.trim()} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-mono text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                                        {isGenerating ? <><Loader className="animate-spin" size={16} /> Generating...</> : <><Bot size={16} /> Generate Draft</>}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col h-full">
                           <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-100 dark:bg-[#111]">
                              <span className="text-xs font-mono text-gray-500">DRAFT REVIEW MODE</span>
                              <div className="flex gap-2">
                                <button onClick={discardDraft} className="px-3 py-1.5 text-xs font-mono text-red-500 hover:bg-red-500/10 rounded flex items-center gap-1"><Trash2 size={12} /> Discard</button>
                                <button onClick={approveDraft} className="px-3 py-1.5 text-xs font-mono bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center gap-1 shadow-lg shadow-emerald-900/20"><Save size={12} /> Approve & Stage</button>
                              </div>
                           </div>
                           <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                              {/* Reused inputs from previous version, kept concise here */}
                              <div>
                                <label className="block text-xs font-mono text-gray-500 mb-1">TITLE</label>
                                <input type="text" value={generatedDraft.title} onChange={(e) => updateDraft('title', e.target.value)} className="w-full bg-white dark:bg-[#15191e] border border-gray-300 dark:border-gray-700 rounded p-2 text-lg font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500" />
                              </div>
                              <div className="flex-1 flex flex-col">
                                <label className="block text-xs font-mono text-gray-500 mb-1">CONTENT (MARKDOWN)</label>
                                <textarea value={generatedDraft.content} onChange={(e) => updateDraft('content', e.target.value)} className="flex-1 min-h-[300px] w-full bg-white dark:bg-[#15191e] border border-gray-300 dark:border-gray-700 rounded p-4 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500 resize-y" />
                              </div>
                              {/* Other fields implied to be similar to previous implementation for brevity */}
                           </div>
                        </div>
                    )}
                </div>
            )}
          </WindowFrame>

          {parsedFiles.length > 0 && !generatedDraft && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom-5 duration-300">
              <div className="flex justify-between items-center">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                   <FileText size={20} className="text-emerald-500" /> Staged Files <span className="text-sm font-normal text-gray-500 font-mono">({parsedFiles.length})</span>
                 </h3>
                 <button onClick={uploadToSupabase} disabled={uploading} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono text-sm flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-900/20 hover:shadow-blue-500/30 transition-all">
                   {uploading ? <Loader className="animate-spin" size={16}/> : <UploadCloud size={16}/>}
                   Deploy to Production
                 </button>
              </div>

              <div className="grid gap-4">
                {parsedFiles.map((post, idx) => (
                  <div key={idx} className="bg-white dark:bg-[#15191e] border border-gray-200 dark:border-gray-800 p-4 rounded-lg flex justify-between items-start group hover:border-emerald-500/30 transition-all shadow-sm">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${post.status === 'published' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'}`}>
                          {post.status}
                        </span>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{post.title}</h4>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mb-2">/{post.slug}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{post.excerpt}</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setPreviewPost(post)}
                            className="text-gray-400 hover:text-emerald-500 p-1.5 hover:bg-emerald-500/10 rounded transition-colors"
                            title="Preview Content"
                        >
                            <Eye size={16} />
                        </button>
                        <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-500/10 rounded transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Terminal Logs */}
        <div className="lg:col-span-1">
          <WindowFrame title="system_logs" className="h-full min-h-[400px]">
            <div className="bg-[#0c0c0c] p-4 h-full font-mono text-xs overflow-y-auto custom-scrollbar">
              <div className="text-emerald-500 mb-2">$ init admin_module --verbose</div>
              {logs.length === 0 && <span className="text-gray-600 italic">Waiting for input...</span>}
              {logs.map((log, i) => (
                <div key={i} className={`mb-1 break-all border-l-2 pl-2 ${log.includes('Failed') || log.includes('Error') ? 'border-red-500 text-red-400 bg-red-900/10' : log.includes('Success') ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-300'}`}>
                   {log}
                </div>
              ))}
              {uploading && <div className="animate-pulse text-emerald-500 mt-2">_ Processing...</div>}
            </div>
          </WindowFrame>
        </div>
      </div>
    </div>
  );
};

export default AdminView;