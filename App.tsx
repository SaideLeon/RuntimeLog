import React, { useState, useEffect } from 'react';
import { ViewState, BlogPost, UserProfile } from './types';
import { CATEGORIES } from './constants';
import GridBackground from './components/GridBackground';
import Hero from './components/Hero';
import WindowFrame from './components/WindowFrame';
import ArticleView from './components/ArticleView';
import SubscribeView from './components/SubscribeView';
import AboutView from './components/AboutView';
import AdminView from './components/AdminView';
import AuthModal from './components/AuthModal'; 
import { supabase } from './services/supabaseClient'; 
import { Search, Cpu, ChevronRight, Sparkles, Sun, Moon, LogIn, LogOut, ShieldAlert, EyeOff } from 'lucide-react';
import { generateSearchInsights } from './services/geminiService';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('HOME');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInsight, setSearchInsight] = useState('');
  
  // Data State
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved as 'dark' | 'light';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // Helper to check for abort errors
  const isAbortError = (err: any) => {
    return (
      err?.name === 'AbortError' || 
      (err?.message && (
         err.message.includes('signal is aborted') || 
         err.message.includes('AbortError')
      ))
    );
  };

  // Fetch Posts from Supabase
  const fetchPosts = async () => {
    // Only set loading on initial fetch if posts are empty to avoid flicker on realtime updates
    if (posts.length === 0) setLoadingPosts(true);
    
    try {
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      // Logic: If user is NOT admin, only show 'published'.
      // If user IS admin, show everything.
      
      const { data: { session } } = await supabase.auth.getSession();
      
      // Determine if we should filter
      let isAdmin = false;
      if (session?.user) {
         // Optimistic check or fetch profile
         try {
             const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
             if (profile?.role === 'admin') isAdmin = true;
         } catch (profileErr) {
             // Ignore profile fetch errors here, assume not admin
         }
      }

      if (!isAdmin) {
         query = query.eq('status', 'published');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        const formattedPosts: BlogPost[] = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt,
          category: p.category,
          readTime: p.read_time,
          date: new Date(p.created_at).toLocaleDateString(),
          content: p.content,
          tags: p.tags,
          slug: p.slug,
          status: p.status
        }));
        setPosts(formattedPosts);
      }
    } catch (err: any) {
      if (isAbortError(err)) {
          return;
      }
      console.error('Error loading posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserProfile(session.user.id);
    }).catch(err => {
        if (!isAbortError(err)) console.error("Session check error:", err);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    // Realtime subscription for Posts
    const postsChannel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts(); // Refresh on any change
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(postsChannel);
    };
  }, []);

  // When userProfile changes (e.g. login as admin), re-fetch posts to potentially reveal drafts
  useEffect(() => {
     fetchPosts();
  }, [userProfile]);

  const fetchUserProfile = async (userId: string) => {
    try {
        const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
        if (error) throw error;

        if (data) {
            setUserProfile(data as UserProfile);
        }
    } catch (err: any) {
        if (!isAbortError(err)) {
            // Only log real errors
            console.error("Error fetching user profile:", err);
        }
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setViewState('HOME');
  };

  const filteredPosts = posts.filter(post => 
    (activeCategory === 'all' || post.category === activeCategory) &&
    (post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentPostIndex = selectedPost ? posts.findIndex(p => p.id === selectedPost.id) : -1;
  const previousPost = currentPostIndex > 0 ? posts[currentPostIndex - 1] : null;
  const nextPost = currentPostIndex !== -1 && currentPostIndex < posts.length - 1 ? posts[currentPostIndex + 1] : null;

  return (
    <div className="min-h-screen relative selection:bg-emerald-500/30 selection:text-emerald-900 dark:selection:text-emerald-200">
      <GridBackground />
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-lg border-b border-gray-200 dark:border-white/5 z-50 flex items-center px-6 justify-between transition-colors duration-300">
        <div 
          className="flex items-center gap-2 font-mono font-bold text-xl tracking-tighter cursor-pointer text-gray-900 dark:text-gray-200"
          onClick={handleBack}
        >
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-black shadow-sm">
            <Cpu size={20} />
          </div>
          <span>Runtime<span className="text-emerald-600 dark:text-emerald-500">::Log</span></span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-mono text-gray-600 dark:text-gray-400">
          <button onClick={() => setViewState('HOME')} className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ${viewState === 'HOME' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>/posts</button>
          <button onClick={() => setViewState('SUBSCRIBE')} className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ${viewState === 'SUBSCRIBE' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>/subscribe</button>
          <button onClick={() => setViewState('ABOUT')} className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ${viewState === 'ABOUT' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>/about</button>
          
          {userProfile?.role === 'admin' && (
             <button onClick={() => setViewState('ADMIN')} className={`flex items-center gap-1 hover:text-red-500 transition-colors ${viewState === 'ADMIN' ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
               <ShieldAlert size={14} /> /admin
             </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme} 
            className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-white transition-colors p-1"
            aria-label="Toggle Dark Mode"
          >
             {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-700"></div>
          
          {user ? (
            <div className="flex items-center gap-3">
               <span className="hidden sm:inline-block text-xs font-mono text-emerald-600 dark:text-emerald-500">
                  {userProfile?.username || user.email?.split('@')[0]}
               </span>
               <button 
                 onClick={handleLogout}
                 className="flex items-center gap-2 text-xs font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
               >
                 <LogOut size={14} />
                 Logout
               </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 text-xs font-mono bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20"
            >
              <LogIn size={14} />
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative pt-16 min-h-screen flex flex-col">
        
        {viewState === 'HOME' && (
          <>
            <Hero onSubscribe={() => setViewState('SUBSCRIBE')} />
            
            <div className="max-w-7xl mx-auto px-4 w-full pb-20">
              {/* Filter Bar */}
              <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 scrollbar-hide">
                  <button 
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2 rounded-full text-sm font-mono transition-all whitespace-nowrap border ${activeCategory === 'all' 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20' 
                      : 'bg-white dark:bg-[#0b0e11] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-emerald-500/50'}`}
                  >
                    All Systems
                  </button>
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`px-4 py-2 rounded-full text-sm font-mono transition-all whitespace-nowrap border ${activeCategory === cat.name 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20' 
                        : 'bg-white dark:bg-[#0b0e11] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-emerald-500/50'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSearch} className="relative w-full md:w-64 flex-shrink-0">
                   <div className="relative group">
                     <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                     <input 
                       type="text" 
                       placeholder="grep 'search_query'" 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full bg-white dark:bg-[#0b0e11] border border-gray-200 dark:border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all text-gray-900 dark:text-white"
                     />
                   </div>
                </form>
              </div>

              {/* AI Insight Box (Visible only when searching) */}
              {searchQuery.length > 2 && searchInsight && (
                  <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    <WindowFrame title="ai_insight.log" className="bg-gradient-to-r from-emerald-500/5 to-transparent border-emerald-500/20">
                        <div className="p-4 flex gap-4 items-start">
                             <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <Sparkles size={20} />
                             </div>
                             <div>
                                <h4 className="text-xs font-mono text-emerald-600 dark:text-emerald-500 mb-1 uppercase tracking-wider">Neural Analysis</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
                                   "{searchInsight}"
                                </p>
                             </div>
                        </div>
                    </WindowFrame>
                  </div>
              )}

              {/* Blog Grid */}
              {loadingPosts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-64 rounded-lg bg-gray-200 dark:bg-[#111] animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.map((post) => (
                    <div 
                      key={post.id}
                      onClick={() => handlePostClick(post)}
                      className="group relative bg-white dark:bg-[#0b0e11] border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:border-emerald-500/50 transition-all duration-300 cursor-pointer flex flex-col h-full shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 hover:-translate-y-1"
                    >
                      {/* Top Bar Decoration */}
                      <div className="h-1 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 group-hover:from-emerald-500 group-hover:to-teal-500 transition-all duration-300"></div>
                      
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-500 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/10 rounded border border-emerald-500/10">
                            {post.category}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">{post.date}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/50">
                          <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                             <Cpu size={12} /> {post.readTime}
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Read <ChevronRight size={16} className="text-emerald-500" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loadingPosts && filteredPosts.length === 0 && (
                <div className="text-center py-20">
                  <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-[#111] text-gray-400 mb-4">
                     <Search size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No data found</h3>
                  <p className="text-gray-500 font-mono">Query returned 0 results. Try adjusting search parameters.</p>
                </div>
              )}
            </div>
          </>
        )}

        {viewState === 'ARTICLE' && selectedPost && (
          <ArticleView 
            post={selectedPost} 
            user={user}
            onAuthRequest={() => setShowAuthModal(true)}
            onBack={handleBack}
            previousPost={previousPost}
            nextPost={nextPost}
            onNavigate={handlePostClick}
          />
        )}

        {viewState === 'SUBSCRIBE' && <SubscribeView />}
        
        {viewState === 'ABOUT' && <AboutView />}

        {viewState === 'ADMIN' && <AdminView user={user} />}

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#050505] border-t border-gray-200 dark:border-white/5 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2 font-mono text-sm text-gray-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              System Status: Operational
           </div>
           <div className="text-gray-500 text-sm font-mono text-center md:text-right">
              © 2024 Runtime::Log. All processes terminated successfully.
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;