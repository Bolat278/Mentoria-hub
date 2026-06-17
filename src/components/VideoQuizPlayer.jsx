import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VideoQuizPlayer({ 
  videoUrl, 
  quizQuestion, 
  quizOptions, 
  correctIndex, 
  pauseAtSeconds, 
  onQuizPassed 
}) {
  const videoRef = useRef(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    setProgress((currentTime / duration) * 100);

    // Trigger quiz logic
    if (
      pauseAtSeconds && 
      currentTime >= pauseAtSeconds && 
      currentTime < pauseAtSeconds + 1 && 
      !quizAnswered && 
      !showQuiz
    ) {
      videoRef.current.pause();
      setShowQuiz(true);
      // Disable controls so user can't skip the quiz by dragging the timeline
      videoRef.current.controls = false;
    }
  };

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
    if (index === correctIndex) {
      setQuizAnswered(true);
      onQuizPassed();
      setTimeout(() => {
        setShowQuiz(false);
        if (videoRef.current) {
          videoRef.current.controls = true;
          videoRef.current.play();
        }
      }, 1500);
    }
  };

  // Ensure default video url if none provided (for demo purposes)
  const sourceUrl = videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
      <video
        ref={videoRef}
        src={sourceUrl}
        className="w-full h-full object-contain"
        controls
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
           if(quizAnswered || !pauseAtSeconds) onQuizPassed();
        }}
      />
      
      {/* Custom Progress Bar overlay for aesthetics */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
        <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Quiz Overlay */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg glass-panel p-8"
            >
              <div className="mb-6">
                <span className="bg-accent/20 text-accent text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">Knowledge Check</span>
                <h3 className="text-2xl font-bold text-white">{quizQuestion}</h3>
              </div>
              
              <div className="space-y-3">
                {quizOptions.map((option, index) => {
                  let buttonClass = "w-full text-left p-4 rounded-xl border transition-all text-sm font-medium ";
                  let icon = null;

                  if (selectedAnswer === index) {
                    if (index === correctIndex) {
                      buttonClass += "bg-green-500/20 border-green-500 text-green-100";
                      icon = <CheckCircle className="w-5 h-5 text-green-500" />;
                    } else {
                      buttonClass += "bg-red-500/20 border-red-500 text-red-100";
                      icon = <XCircle className="w-5 h-5 text-red-500" />;
                    }
                  } else {
                    buttonClass += "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer === correctIndex}
                      className={`${buttonClass} flex justify-between items-center`}
                    >
                      <span>{option}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
