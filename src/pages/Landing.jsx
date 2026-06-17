import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, PlayCircle, Map as MapIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-secondary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" /> The future of education is here
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Level up your skills with <br className="hidden md:block" />
            <span className="text-gradient">Mentoria Hub</span>
          </h1>
          <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Discover top olympiads, internships, and hackathons. Learn through interactive video courses and unlock your gamified skill roadmap.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/auth" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
              Начать бесплатно <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
        >
          <div className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-6 text-accent">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Smart Catalog</h3>
            <p className="text-gray-400">Tinder-style swipeable catalog of opportunities tailored to your interests.</p>
          </div>
          <div className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center mb-6 text-secondary">
              <PlayCircle className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Video Courses</h3>
            <p className="text-gray-400">Engaging video lessons with interactive freeze-quizzes to test your knowledge.</p>
          </div>
          <div className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
              <MapIcon className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Skill Roadmap</h3>
            <p className="text-gray-400">Gamified skill tree. Unlock nodes and progress through your academic journey.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
