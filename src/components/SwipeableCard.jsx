import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';

export default function SwipeableCard({ opportunity, onSwipeRight, onSwipeLeft, style }) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  
  // Opacity based on distance
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  // Rotation based on distance
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  
  // Icon opacities
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [0, -100], [0, 1]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      setExitX(200);
      onSwipeRight(opportunity);
    } else if (info.offset.x < -100) {
      setExitX(-200);
      onSwipeLeft(opportunity);
    }
  };

  return (
    <motion.div
      style={{
        ...style,
        x,
        opacity,
        rotate,
        cursor: 'grab'
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.2 } }}
      className="absolute w-full max-w-sm h-[500px] glass-panel overflow-hidden flex flex-col shadow-2xl"
    >
      {/* Overlay Icons */}
      <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 z-20 pointer-events-none">
        <div className="border-4 border-green-500 text-green-500 font-bold text-4xl px-4 py-1 rounded-xl transform -rotate-12">
          LIKE
        </div>
      </motion.div>
      <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-8 z-20 pointer-events-none">
        <div className="border-4 border-red-500 text-red-500 font-bold text-4xl px-4 py-1 rounded-xl transform rotate-12">
          NOPE
        </div>
      </motion.div>

      <div className="h-1/2 bg-gray-800 relative pointer-events-none">
        {opportunity.image_url ? (
          <img src={opportunity.image_url} alt={opportunity.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/30 to-secondary/30 flex items-center justify-center">
            <span className="font-bold text-3xl uppercase tracking-widest opacity-30">{opportunity.type}</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
          <span className="bg-accent text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
            {opportunity.type}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1 pointer-events-none bg-[#151520]">
        <h3 className="text-2xl font-bold mb-2 line-clamp-2">{opportunity.title}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {opportunity.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs text-gray-300">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{opportunity.description}</p>
        <div className="mt-auto flex justify-between items-center text-sm font-medium">
          <span className="text-red-400">
            Due: {new Date(opportunity.deadline).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
