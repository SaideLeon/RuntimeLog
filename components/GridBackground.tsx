import React from 'react';

const GridBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050505]">
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>
      
      {/* Radial Gradient for spotlight effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#10b98115,transparent)]"></div>
    </div>
  );
};

export default GridBackground;
