import React from 'react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isFramed: boolean;
  onToggleFrame: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children, isFramed }) => {
  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center overflow-hidden p-1 sm:p-3">
      {/* Compact Mobile Phone Container - Less wide (340px) and less tall (640px) */}
      <div
        className={`relative w-full h-full flex flex-col overflow-hidden transition-all duration-300 ${
          isFramed
            ? 'max-w-[340px] h-[640px] max-h-[94dvh] rounded-[28px] border-[3px] border-slate-800 shadow-2xl ring-1 ring-slate-700/50'
            : 'max-w-[340px] h-[640px] max-h-[100dvh] rounded-none border-none shadow-none'
        } bg-slate-950`}
      >
        {/* Fullscreen Game Content - Zero status bar, zero bottom gray bar */}
        <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};
