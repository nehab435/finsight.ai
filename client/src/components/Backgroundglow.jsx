import React from 'react';

const BackgroundGlow = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Top Left Mint Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-fin-mint/20 rounded-full blur-[150px] animate-glow-pulse"></div>
      
      {/* Bottom Right Blue Glow */}
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[150px] animate-glow-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  );
};

export default BackgroundGlow;