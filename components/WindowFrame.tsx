import React from 'react';

interface WindowFrameProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  active?: boolean;
}

const WindowFrame: React.FC<WindowFrameProps> = ({ children, className = '', title, active = false }) => {
  return (
    <div className={`relative group ${className}`}>
      {/* Neon Glow effect underneath - subtler in light mode */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg blur opacity-0 dark:opacity-10 group-hover:opacity-20 dark:group-hover:opacity-30 transition duration-500 ${active ? 'opacity-30 dark:opacity-40' : ''}`}></div>
      
      {/* Main Container */}
      <div className="relative h-full bg-white/80 dark:bg-[#0b0e11]/90 backdrop-blur-md border border-gray-200 dark:border-emerald-500/30 rounded-lg flex flex-col overflow-hidden shadow-xl dark:shadow-none transition-colors duration-300">
        
        {/* Title Bar */}
        <div className="h-8 border-b border-gray-200 dark:border-emerald-500/20 flex items-center px-3 space-x-2 bg-gray-50/80 dark:bg-[#050505]/50 transition-colors duration-300">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          </div>
          {title && (
            <span className="ml-3 text-xs font-mono text-gray-500 dark:text-emerald-500/70 truncate uppercase tracking-wider">
              {title}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default WindowFrame;