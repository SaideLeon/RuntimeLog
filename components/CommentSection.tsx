import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { MessageSquare, CornerDownRight, Send, User as UserIcon, Loader, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: {
    username: string;
    avatar_url: string;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  user: any; // Supabase user object
  onAuthRequest: () => void;
}

const CommentItem: React.FC<{ 
  comment: Comment; 
  user: any; 
  onReply: (parentId: string, username: string) => void 
}> = ({ comment, user, onReply }) => {
  return (
    <div className="mb-6 group">
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {comment.profiles?.avatar_url ? (
            <img 
              src={comment.profiles.avatar_url} 
              alt={comment.profiles.username} 
              className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <UserIcon size={14} />
            </div>
          )}
        </div>
        <div className="flex-grow">
          <div className="bg-gray-50 dark:bg-[#15191e] border border-gray-200 dark:border-gray-800 rounded-lg p-3 relative hover:border-emerald-500/30 transition-colors">
             <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-gray-900 dark:text-emerald-400 font-mono">
                  @{comment.profiles?.username || 'anon_user'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
             </div>
             <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
               {comment.content}
             </p>
             {user && (
               <button 
                 onClick={() => onReply(comment.id, comment.profiles?.username)}
                 className="mt-2 text-[10px] font-bold text-gray-400 hover:text-emerald-500 flex items-center gap-1 transition-colors uppercase tracking-wider"
               >
                 <CornerDownRight size={10} /> Reply
               </button>
             )}
          </div>
        </div>
      </div>
      
      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 pl-4 border-l border-gray-200 dark:border-gray-800 mt-4 space-y-4">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} user={user} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({ postId, user, onAuthRequest }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Build tree
      const commentMap = new Map();
      const roots: Comment[] = [];

      data?.forEach((comment: any) => {
        comment.replies = [];
        commentMap.set(comment.id, comment);
      });

      data?.forEach((comment: any) => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) parent.replies.push(comment);
        } else {
          roots.push(comment);
        }
      });

      setComments(roots);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    
    // Simple realtime subscription for refresh
    const channel = supabase
      .channel('public:comments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('comments').insert({
        content: newComment.trim(),
        post_id: postId,
        user_id: user.id,
        parent_id: replyingTo?.id || null,
      });

      if (error) throw error;

      setNewComment('');
      setReplyingTo(null);
      // Fetch handled by realtime subscription
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
        <MessageSquare size={20} className="text-emerald-500" />
        Discussion <span className="text-sm font-normal text-gray-500 font-mono">({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})</span>
      </h3>

      {/* Input Area */}
      <div className="mb-10">
        {!user ? (
          <div className="bg-gray-50 dark:bg-[#15191e] rounded-lg p-6 text-center border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">Log in to join the conversation and interact with other engineers.</p>
            <button 
              onClick={onAuthRequest}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-mono text-sm font-bold transition-colors shadow-lg shadow-emerald-900/20"
            >
              /bin/login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative">
            {replyingTo && (
              <div className="flex items-center justify-between bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-2 rounded-t text-xs font-mono mb-px mx-1">
                <span>Replying to @{replyingTo.username}</span>
                <button type="button" onClick={() => setReplyingTo(null)} className="hover:text-emerald-200">
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="relative">
                <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-white dark:bg-[#0b0e11] border border-gray-300 dark:border-gray-700 rounded-lg p-4 min-h-[100px] text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all dark:text-white resize-none"
                />
                <button 
                type="submit" 
                disabled={submitting || !newComment.trim()}
                className="absolute bottom-3 right-3 p-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                {submitting ? <Loader className="animate-spin" size={16} /> : <Send size={16} />}
                </button>
            </div>
          </form>
        )}
      </div>

      {/* Comment List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader className="animate-spin text-emerald-500" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center text-gray-500 font-mono text-sm py-8 italic">
          No signals detected yet. Be the first to transmit.
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              user={user} 
              onReply={(id, username) => {
                  setReplyingTo({ id, username });
                  const input = document.querySelector('textarea');
                  if (input) {
                      input.focus();
                      input.scrollIntoView({ behavior: 'smooth' });
                  }
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;