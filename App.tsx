import React, { useState } from 'react';
import { ViewState, BlogPost } from './types';
import { INITIAL_POSTS, CATEGORIES } from './constants';
import GridBackground from './components/GridBackground';
import Hero from './components/Hero';
import WindowFrame from './components/WindowFrame';
import ArticleView from './components/ArticleView';
import { Search, Github, Twitter, Cpu, ChevronRight, Sparkles } from 'lucide-react';
import { generateSearchInsights } from './services/geminiService';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('HOME');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInsight, setSearchInsight] = useState('');

  const handlePostClick = (post: BlogPost) => {
    setSelectedPost(post);
    setViewState('ARTICLE');
    window.scrollTo(0,0);
  };

  const handleBack = () => {
    setViewState('HOME');
    setSelectedPost(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length > 2) {
        const insight = await generateSearchInsights(searchQuery);
        setSearchInsight(insight);
    }
  };

  const filteredPosts = INITIAL_POSTS.filter(post => 
    (activeCategory === 'all' || post.category === activeCategory) &&
    (post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen relative text-gray-200 selection:bg-emerald-500/30 selection:text-emerald-200">
      <GridBackground />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-[#050505]/80 backdrop-blur-lg border-b border-white/5 z-50 flex items-center px-6 justify-between">
        <div 
          className="flex items-center gap-2 font-mono font-bold text-xl tracking-tighter cursor-pointer"
          onClick={handleBack}
        >
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-black">
            <Cpu size={20} />
          </div>
          <span>Runtime<span className="text-emerald-500">::Log</span></span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-mono text-gray-400">
          <a href="#" className="hover:text-emerald-400 transition-colors">/posts</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">/snippets</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">/about</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="#" className="text-gray-400 hover:text-white transition-colors"><Github size={20} /></a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter size={20} /></a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative pt-16 min-h-screen flex flex-col">
        
        {viewState === 'HOME' && (
          <>
            <Hero />
            
            <div className="max-w-7xl mx-auto px-4 w-full pb-20">
              {/* Filter Bar */}
              <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 scrollbar-hide">
                  <button 
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2 rounded-full text-sm font-mono transition-all whitespace-nowrap border ${activeCategory === 'all' ? 'bg-emerald-500 text-black border-emerald-500 font-bold' : 'bg-transparent border-gray-800 text-gray-400 hover:border-emerald-500/50'}`}
                  >
                    ./all
                  </button>
                  {CATEGORIES.map(cat => (
                     <button 
                     key={cat.id}
                     onClick={() => setActiveCategory(cat.name)}
                     className={`px-4 py-2 rounded-full text-sm font-mono transition-all whitespace-nowrap border ${activeCategory === cat.name ? 'bg-emerald-500 text-black border-emerald-500 font-bold' : 'bg-transparent border-gray-800 text-gray-400 hover:border-emerald-500/50'}`}
                   >
                     {cat.name}
                   </button>
                  ))}
                </div>

                <form onSubmit={handleSearch} className="relative group">
                    <input 
                      type="text" 
                      placeholder="grep 'search_query'..." 
                      className="bg-[#0b0e11] border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm font-mono focus:outline-none focus:border-emerald-500 w-full md:w-64 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-emerald-500" size={16} />
                </form>
              </div>

              {searchInsight && (
                  <div className="mb-8 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg flex items-start gap-3">
                      <div className="mt-1"><Sparkles size={16} className="text-emerald-400" /></div>
                      <div>
                          <p className="text-sm text-emerald-200 font-mono">AI Insight: {searchInsight}</p>
                      </div>
                  </div>
              )}

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <div 
                    key={post.id} 
                    onClick={() => handlePostClick(post)}
                    className="cursor-pointer h-full"
                  >
                    <WindowFrame className="h-full hover:-translate-y-2 transition-transform duration-300">
                      <div className="flex flex-col h-full">
                        <div className="mb-4">
                           <span className="text-emerald-500 text-xs font-mono mb-2 block">{post.category}</span>
                           <h3 className="text-xl font-bold text-white mb-2 leading-snug group-hover:text-emerald-400 transition-colors">
                             {post.title}
                           </h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs font-mono text-gray-500 mt-auto pt-4 border-t border-gray-800">
                          <span>{post.date}</span>
                          <span className="flex items-center gap-1 group-hover:text-white transition-colors">
                            Read <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    </WindowFrame>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {viewState === 'ARTICLE' && selectedPost && (
          <ArticleView post={selectedPost} onBack={handleBack} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#020202] py-12 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="text-gray-500 text-sm font-mono">
             © 2024 Runtime::Log. All systems operational.
           </div>
           <div className="flex gap-4">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-emerald-500/50 text-xs font-mono uppercase">Server Online</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;