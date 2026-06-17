import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, Play } from 'lucide-react';

export default function RoadmapNode({ title, status, index, isLast }) {
  // status: 'completed' | 'current' | 'locked'
  
  const getColors = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 border-green-500 text-green-400';
      case 'current':
        return 'bg-accent/20 border-accent text-accent shadow-[0_0_30px_rgba(124,58,237,0.5)]';
      case 'locked':
      default:
        return 'bg-white/5 border-white/10 text-gray-500';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-6 h-6" />;
      case 'current': return <Play className="w-6 h-6 ml-1" />;
      case 'locked': return <Lock className="w-5 h-5" />;
      default: return null;
    }
  };

  // Alternating layout for snake-like path
  const isLeft = index % 2 === 0;

  return (
    <div className={`flex items-center w-full my-8 ${isLeft ? 'justify-start' : 'justify-end'} relative`}>
      {/* Path Line */}
      {!isLast && (
        <svg className="absolute w-full h-32 top-1/2 left-0 pointer-events-none -z-10" preserveAspectRatio="none">
          <path 
            d={isLeft 
              ? "M 100 0 C 300 0, 80% 100, calc(100% - 100px) 100" 
              : "M calc(100% - 100px) 0 C 20% 0, 100 100, 100 100"} 
            fill="none" 
            stroke={status === 'completed' ? '#22c55e' : 'rgba(255,255,255,0.1)'} 
            strokeWidth="4"
            strokeDasharray={status === 'locked' ? "8 8" : "none"}
          />
        </svg>
      )}

      <motion.div 
        whileHover={status !== 'locked' ? { scale: 1.05 } : {}}
        className={`relative z-10 flex items-center gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'} max-w-sm w-full mx-4 md:mx-24`}
      >
        <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${getColors()}`}>
          {getIcon()}
          {status === 'current' && (
            <div className="absolute inset-0 rounded-full border-2 border-accent animate-ping opacity-20" />
          )}
        </div>
        
        <div className={`glass-panel p-4 flex-1 ${isLeft ? 'text-left' : 'text-right'}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Stage {index + 1}</div>
          <h3 className={`font-bold ${status === 'locked' ? 'text-gray-400' : 'text-white'}`}>{title}</h3>
        </div>
      </motion.div>
    </div>
  );
}
