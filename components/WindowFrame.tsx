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
      {/* Neon Glow effect underneath */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg blur opacity-10 group-hover:opacity-30 transition duration-500 ${active ? 'opacity-40' : ''}`}></div>
      
      {/* Main Container */}
      <div className="relative h-full bg-[#0b0e11]/90 backdrop-blur-md border border-emerald-500/30 rounded-lg flex flex-col overflow-hidden">
        
        {/* Title Bar */}
        <div className="h-8 border-b border-emerald-500/20 flex items-center px-3 space-x-2 bg-[#050505]/50">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          </div>
          {title && (
            <span className="ml-3 text-xs font-mono text-emerald-500/70 truncate uppercase tracking-wider">
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
