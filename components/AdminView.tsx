import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { generateFullPost } from '../services/geminiService';
import WindowFrame from './WindowFrame';
import { UploadCloud, FileText, Loader, X, Bot, PenTool, Save, Trash2, Sparkles, AlertTriangle, Eye, CheckCircle, Edit, RefreshCw, Search, ArrowLeft, Plus, History, RotateCcw } from 'lucide-react';
import { CATEGORIES } from '../constants';
import ArticleView from './ArticleView';
import { BlogPost } from '../types';

interface AdminViewProps {
  user: any;
}

const AdminView: React.FC<AdminViewProps> = ({ user }) => {
  // Mode: 'create' | 'edit-list' | 'edit-form'
  const [viewMode, setViewMode] = useState<'create' | 'edit-list' | 'edit-form'>('create');
  
  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [readTime, setReadTime] = useState('5 min read');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // Edit Mode State
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postList, setPostList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // AI & Processing State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Autosave State
  const [lastAutosaved, setLastAutosaved] = useState<Date | null>(null);
  const [hasLocalDraft, setHasLocalDraft] = useState(false);

  // --- Autosave Logic ---

  const getStorageKey = () => {
    return editingPostId ? `autosave_draft_${editingPostId}` : 'autosave_draft_new';
  };

  // Check for existing draft on mount or mode switch
  useEffect(() => {
    const key = getStorageKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      // Don't flag if the saved content is identical to initial empty state (for new posts)
      const parsed = JSON.parse(saved);
      const isNotEmpty = parsed.title || parsed.content || parsed.slug;
      if (isNotEmpty) {
        setHasLocalDraft(true);
      }
    } else {
      setHasLocalDraft(false);
    }
  }, [viewMode, editingPostId]);

  // Autosave Interval (30s)
  useEffect(() => {
    if (viewMode === 'edit-list') return;

    const interval = setInterval(() => {
      // Only autosave if there is some content
      if (!title && !content && !slug) return;

      const draftData = {
        title,
        slug,
        excerpt,
        content,
        category,
        tags,
        readTime,
        status,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(getStorageKey(), JSON.stringify(draftData));
      setLastAutosaved(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [title, slug, excerpt, content, category, tags, readTime, status, viewMode, editingPostId]);

  const handleRestoreDraft = () => {
    try {
      const key = getStorageKey();
      const saved = localStorage.getItem(key);
      if (!saved) return;

      const data = JSON.parse(saved);
      setTitle(data.title || '');
      setSlug(data.slug || '');
      setExcerpt(data.excerpt || '');
      setContent(data.content || '');
      setCategory(data.category || CATEGORIES[0].name);
      setTags(data.tags || []);
      setReadTime(data.readTime || '5 min read');
      setStatus(data.status || 'draft');
      
      setHasLocalDraft(false); // Hide banner after restore
      alert("Draft restored from local storage.");
    } catch (e) {
      console.error("Failed to restore draft", e);
    }
  };

  const clearLocalDraft = () => {
    localStorage.removeItem(getStorageKey());
    setHasLocalDraft(false);
    setLastAutosaved(null);
  };

  // --- End Autosave Logic ---

  // Fetch posts when entering list view
  useEffect(() => {
    if (viewMode === 'edit-list') {
      fetchPostList();
    }
  }, [viewMode]);

  const fetchPostList = async () => {
    setLoadingList(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, status, created_at, category, slug')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPostList(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleEditSelect = async (postId: string) => {
    setSaveStatus('idle');
    setHasLocalDraft(false); // Reset before loading new context
    setLastAutosaved(null);
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();
        
      if (error) throw error;
      if (data) {
        setEditingPostId(data.id);
        setTitle(data.title);
        setSlug(data.slug);
        setExcerpt(data.excerpt || '');
        setContent(data.content || '');
        setCategory(data.category);
        setTags(data.tags || []);
        setReadTime(data.read_time);
        setStatus(data.status);
        setViewMode('edit-form');
      }
    } catch (err) {
      console.error("Error loading post details:", err);
      alert("Failed to load post.");
    }
  };

  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${postTitle}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      
      // Clear autosave if deleting the currently edited post
      localStorage.removeItem(`autosave_draft_${postId}`);
      
      fetchPostList(); // Refresh list
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post.");
    }
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setCategory(CATEGORIES[0].name);
    setTags([]);
    setReadTime('5 min read');
    setStatus('draft');
    setEditingPostId(null);
    setSaveStatus('idle');
    setLastAutosaved(null);
    setHasLocalDraft(false);
  };

  const handleCreateNew = () => {
    resetForm();
    setViewMode('create');
  };

  const handleGenerateAI = async () => {
    if (!aiTopic) return;
    setIsGenerating(true);
    try {
      const generated = await generateFullPost(aiTopic);
      setTitle(generated.title);
      setSlug(generated.slug);
      setExcerpt(generated.excerpt);
      setContent(generated.content);
      setCategory(generated.category || CATEGORIES[0].name);
      setTags(generated.tags || []);
      setReadTime(generated.read_time || '5 min read');
    } catch (error) {
      console.error(error);
      alert("Failed to generate content. Check API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      // Simple Frontmatter parser (naïve implementation)
      // Expects --- \n key: value \n ---
      const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
      const match = text.match(frontmatterRegex);

      if (match) {
        const yaml = match[1];
        const body = match[2];
        setContent(body.trim());
        
        // Parse basic yaml keys
        const titleMatch = yaml.match(/title:\s*(.*)/);
        if (titleMatch) setTitle(titleMatch[1].replace(/['"]/g, '').trim());
        
        const slugMatch = yaml.match(/slug:\s*(.*)/);
        if (slugMatch) setSlug(slugMatch[1].trim());

        const excerptMatch = yaml.match(/excerpt:\s*(.*)/);
        if (excerptMatch) setExcerpt(excerptMatch[1].trim());
      } else {
        // Assume raw markdown
        setContent(text);
        setTitle(file.name.replace('.md', ''));
      }
      setUploading(false);
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!title || !slug || !user) {
      alert("Title, Slug and User Auth required.");
      return;
    }
    
    setSaveStatus('saving');
    
    const postData = {
      title,
      slug,
      excerpt,
      content,
      category,
      tags,
      read_time: readTime,
      status,
      author_id: user.id,
      updated_at: new Date().toISOString()
    };

    try {
      if (editingPostId) {
        // UPDATE
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', editingPostId);
        if (error) throw error;
      } else {
        // INSERT
        const { error } = await supabase
          .from('posts')
          .insert([postData]);
        if (error) throw error;
      }
      
      setSaveStatus('success');
      clearLocalDraft(); // Clear autosave on successful commit
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: any) {
      console.error(error);
      setSaveStatus('error');
      alert(`Error saving: ${error.message}`);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag) {
      e.preventDefault();
      if (!tags.includes(currentTag)) {
        setTags([...tags, currentTag]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Preview Object
  const previewPost: BlogPost = {
    id: 'preview',
    title: title || 'Untitled Post',
    excerpt: excerpt || 'No excerpt provided...',
    content: content || '',
    category: category,
    readTime: readTime,
    date: new Date().toLocaleDateString(),
    tags: tags,
    slug: slug,
    status: status
  };

  if (previewMode) {
    return (
      <ArticleView 
        post={previewPost} 
        user={user} 
        onAuthRequest={() => {}} 
        onBack={() => setPreviewMode(false)}
        previewMode={true}
      />
    );
  }

  const renderPostList = () => {
    const filtered = postList.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
             <input 
               type="text"
               placeholder="Search posts..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#15191e] border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors"
             />
          </div>
          <button onClick={fetchPostList} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:text-emerald-500 transition-colors">
            <RefreshCw size={18} className={loadingList ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="bg-white dark:bg-[#0b0e11] border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
           <table className="w-full text-sm text-left">
             <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-[#15191e] border-b border-gray-200 dark:border-gray-800">
               <tr>
                 <th className="px-6 py-3 font-mono">Title</th>
                 <th className="px-6 py-3 font-mono">Status</th>
                 <th className="px-6 py-3 font-mono">Date</th>
                 <th className="px-6 py-3 font-mono text-right">Actions</th>
               </tr>
             </thead>
             <tbody>
               {loadingList ? (
                 <tr><td colSpan={4} className="p-6 text-center"><Loader className="animate-spin mx-auto text-emerald-500" /></td></tr>
               ) : filtered.length === 0 ? (
                 <tr><td colSpan={4} className="p-6 text-center text-gray-500 font-mono">No posts found.</td></tr>
               ) : (
                 filtered.map(post => (
                   <tr key={post.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#15191e]/50 transition-colors">
                     <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200 truncate max-w-xs">{post.title}</td>
                     <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded text-xs font-mono border ${
                         post.status === 'published' 
                          ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                          : 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
                       }`}>
                         {post.status}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                       {new Date(post.created_at).toLocaleDateString()}
                     </td>
                     <td className="px-6 py-4 text-right space-x-2">
                       <button 
                         onClick={() => handleEditSelect(post.id)}
                         className="p-1.5 text-gray-500 hover:text-emerald-500 transition-colors"
                         title="Edit"
                       >
                         <Edit size={16} />
                       </button>
                       <button 
                         onClick={() => handleDeletePost(post.id, post.title)}
                         className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                         title="Delete"
                       >
                         <Trash2 size={16} />
                       </button>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <>
      {hasLocalDraft && (
         <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-lg flex items-center justify-between animate-in slide-in-from-top-2">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-500">
               <History size={16} />
             </div>
             <div>
               <h4 className="text-xs font-bold text-amber-800 dark:text-amber-500 font-mono uppercase">Unsaved Draft Detected</h4>
               <p className="text-sm text-amber-700 dark:text-amber-400/80">
                 Found a newer local version {viewMode === 'create' ? 'of a new post' : 'of this post'}.
               </p>
             </div>
           </div>
           <div className="flex gap-2">
             <button 
               onClick={clearLocalDraft}
               className="px-3 py-1.5 text-xs font-mono text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
             >
               Discard
             </button>
             <button 
               onClick={handleRestoreDraft}
               className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-mono flex items-center gap-1 transition-colors shadow-sm"
             >
               <RotateCcw size={12} />
               Restore Draft
             </button>
           </div>
         </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1 uppercase">Title</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#15191e] border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors dark:text-white"
                placeholder="Ex: Understanding React Fiber"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-gray-500 mb-1 uppercase">Slug</label>
                <input 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#15191e] border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors dark:text-white"
                  placeholder="ex: react-fiber-deep-dive"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 mb-1 uppercase">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#15191e] border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors dark:text-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1 uppercase">Excerpt</label>
              <textarea 
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="w-full bg-gray-50 dark:bg-[#15191e] border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors dark:text-white"
                placeholder="Brief summary for cards..."
              />
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-mono text-gray-500 uppercase">Content (Markdown)</label>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-500 font-mono"
                  disabled={uploading}
                >
                  {uploading ? <Loader size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                  Import .md
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".md,.markdown,.txt" 
                  onChange={handleFileUpload}
                />
              </div>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full bg-gray-50 dark:bg-[#15191e] border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors dark:text-white resize-y"
                placeholder="# Hello World..."
              />
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar settings */}
        <div className="space-y-6">
           {/* AI Generator Box */}
           <div className="p-4 rounded-lg bg-gradient-to-br from-purple-900/10 to-emerald-900/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400 font-mono text-sm font-bold">
                <Bot size={16} />
                <span>AI Draft Generator</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">Generate full article structure using Gemini 3.</p>
              <div className="flex gap-2">
                 <input 
                   value={aiTopic} 
                   onChange={(e) => setAiTopic(e.target.value)}
                   placeholder="Topic..." 
                   className="flex-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs font-mono dark:text-white"
                 />
                 <button 
                   onClick={handleGenerateAI}
                   disabled={isGenerating || !aiTopic}
                   className="bg-emerald-600 text-white p-2 rounded hover:bg-emerald-500 disabled:opacity-50"
                 >
                   {isGenerating ? <Loader className="animate-spin" size={14} /> : <Sparkles size={14} />}
                 </button>
              </div>
           </div>

           {/* Tags */}
           <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#15191e] border border-gray-200 dark:border-gray-700">
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded border border-emerald-500/20">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={10} /></button>
                  </span>
                ))}
              </div>
              <input 
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag + Enter"
                className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-1 text-xs font-mono focus:outline-none focus:border-emerald-500 dark:text-white"
              />
           </div>

           {/* Meta */}
           <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#15191e] border border-gray-200 dark:border-gray-700 space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-500 mb-1 uppercase">Read Time</label>
                <input 
                   value={readTime}
                   onChange={(e) => setReadTime(e.target.value)}
                   className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-xs font-mono dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 mb-1 uppercase">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 text-xs font-mono dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
           </div>

           {/* Actions */}
           <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {lastAutosaved && (
                <div className="text-[10px] text-gray-400 font-mono text-center flex items-center justify-center gap-1">
                   <CheckCircle size={10} className="text-emerald-500" />
                   Autosaved at {lastAutosaved.toLocaleTimeString()}
                </div>
              )}

              <button 
                onClick={() => setPreviewMode(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-mono text-xs font-bold"
              >
                <Eye size={14} /> Preview
              </button>
              <button 
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors font-mono text-xs font-bold shadow-lg shadow-emerald-900/20 disabled:opacity-50"
              >
                {saveStatus === 'saving' ? <Loader className="animate-spin" size={14} /> : 
                 saveStatus === 'success' ? <CheckCircle size={14} /> :
                 saveStatus === 'error' ? <AlertTriangle size={14} /> :
                 <Save size={14} />}
                {saveStatus === 'saving' ? 'Saving...' : 
                 saveStatus === 'success' ? 'Saved!' : 
                 saveStatus === 'error' ? 'Error' : 
                 'Save Post'}
              </button>
              {viewMode === 'edit-form' && (
                 <button 
                   onClick={() => setViewMode('edit-list')}
                   className="text-xs text-gray-500 hover:text-gray-400 font-mono text-center underline"
                 >
                   Cancel Edit
                 </button>
              )}
           </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-center gap-2 text-gray-500 font-mono text-sm">
        <span>root</span>
        <span>/</span>
        <span className="text-emerald-600 dark:text-emerald-500">admin</span>
        <span>/</span>
        <span>cms_console</span>
      </div>

      <WindowFrame title={viewMode === 'edit-list' ? 'database_explorer.sql' : (viewMode === 'create' ? 'new_post_wizard.exe' : `edit_post_${editingPostId}.sh`)} className="shadow-2xl">
        <div className="p-6 md:p-8 bg-white dark:bg-[#0b0e11] min-h-[600px]">
          
          {/* Admin Navigation */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
             <div className="flex gap-2 p-1 bg-gray-100 dark:bg-[#15191e] rounded-lg self-start">
               <button 
                 onClick={handleCreateNew}
                 className={`px-4 py-2 rounded-md text-sm font-mono flex items-center gap-2 transition-all ${viewMode === 'create' ? 'bg-white dark:bg-[#0b0e11] text-emerald-600 dark:text-emerald-500 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
               >
                 <Plus size={16} /> New Post
               </button>
               <button 
                 onClick={() => setViewMode('edit-list')}
                 className={`px-4 py-2 rounded-md text-sm font-mono flex items-center gap-2 transition-all ${viewMode === 'edit-list' || viewMode === 'edit-form' ? 'bg-white dark:bg-[#0b0e11] text-emerald-600 dark:text-emerald-500 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
               >
                 <PenTool size={16} /> Manage Posts
               </button>
             </div>

             <div className="ml-auto text-right hidden md:block">
               <div className="text-xs font-mono text-gray-400">Authenticated as</div>
               <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 justify-end">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  {user.email}
               </div>
             </div>
          </div>

          {/* Content Area */}
          <div className="animate-in fade-in duration-300">
            {viewMode === 'edit-list' ? renderPostList() : renderForm()}
          </div>

        </div>
      </WindowFrame>
    </div>
  );
};

export default AdminView;