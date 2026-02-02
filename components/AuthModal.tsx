import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { X, Mail, Lock, User, Loader, AlertCircle } from 'lucide-react';
import WindowFrame from './WindowFrame';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            },
          },
        });
        if (error) throw error;
        // Auto close on success, or show "check email" message if email confirmation is on
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        <WindowFrame title={isLogin ? "auth_login.exe" : "user_registration.sh"} className="shadow-2xl">
          <div className="p-8 bg-white dark:bg-[#0b0e11]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Join the Network'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                {isLogin ? 'Enter credentials to access root.' : 'Initialize new user profile.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-red-600 dark:text-red-400 font-mono">{error}</p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-500 uppercase">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="dev_master"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#15191e] border border-gray-200 dark:border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors dark:text-white"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-500 uppercase">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="email"
                    placeholder="you@runtime.log"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#15191e] border border-gray-200 dark:border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-500 uppercase">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#15191e] border border-gray-200 dark:border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors dark:text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
              >
                {loading ? <Loader className="animate-spin" size={16} /> : (isLogin ? 'Login' : 'Create Account')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-gray-500 hover:text-emerald-500 font-mono underline underline-offset-4 transition-colors"
              >
                {isLogin ? "Don't have an account? mkdir user" : "Already have an account? sudo login"}
              </button>
            </div>
          </div>
        </WindowFrame>
      </div>
    </div>
  );
};

export default AuthModal;