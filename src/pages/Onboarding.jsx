import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUser } from '../hooks/useUser';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';

const GRADES = [8, 9, 10, 11];
const INTERESTS = ['STEM', 'Business', 'Programming', 'Arts', 'Law', 'Medicine', 'Languages', 'Social Sciences'];

export default function Onboarding() {
  const { user, refetchProfile } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    grade: null,
    interests: [],
    goals: ''
  });

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          grade: formData.grade,
          interests: formData.interests,
          goals: formData.goals
        })
        .eq('id', user.id);

      if (error) throw error;
      
      await refetchProfile();
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8 px-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= i ? 'bg-accent text-white shadow-lg shadow-purple-500/50' : 'bg-white/5 text-gray-500'}`}>
                {step > i ? <Check className="w-5 h-5" /> : i}
              </div>
              {i < 4 && (
                <div className={`w-16 sm:w-32 h-1 mx-2 rounded ${step > i ? 'bg-accent' : 'bg-white/5'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-panel p-8 sm:p-12 overflow-hidden relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col h-full"
              >
                <h2 className="text-3xl font-bold mb-2">What is your name?</h2>
                <p className="text-gray-400 mb-8">Let's get to know you better.</p>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  placeholder="Your full name"
                  autoFocus
                />
                <div className="mt-auto pt-8 flex justify-end">
                  <button 
                    onClick={() => {
                      if (profile?.role === 'teacher') handleComplete();
                      else nextStep();
                    }}
                    disabled={!formData.fullName.trim() || loading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {profile?.role === 'teacher' ? (loading ? 'Saving...' : 'Finish') : 'Continue'} <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col h-full"
              >
                <h2 className="text-3xl font-bold mb-2">What grade are you in?</h2>
                <p className="text-gray-400 mb-8">This helps us tailor your roadmap.</p>
                <div className="grid grid-cols-2 gap-4">
                  {GRADES.map(g => (
                    <button
                      key={g}
                      onClick={() => setFormData({...formData, grade: g})}
                      className={`py-6 rounded-xl text-2xl font-bold border transition-all ${
                        formData.grade === g 
                          ? 'bg-accent/20 border-accent text-accent shadow-lg shadow-purple-500/20' 
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Grade {g}
                    </button>
                  ))}
                </div>
                <div className="mt-auto pt-8 flex justify-end">
                  <button 
                    onClick={nextStep}
                    disabled={!formData.grade}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col h-full"
              >
                <h2 className="text-3xl font-bold mb-2">What are your interests?</h2>
                <p className="text-gray-400 mb-8">Select all that apply.</p>
                <div className="flex flex-wrap gap-3">
                  {INTERESTS.map(interest => {
                    const isSelected = formData.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-6 py-3 rounded-full text-sm font-medium border transition-all ${
                          isSelected
                            ? 'bg-secondary/20 border-secondary text-secondary shadow-lg shadow-teal-500/20'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {interest}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-auto pt-8 flex justify-end">
                  <button 
                    onClick={nextStep}
                    disabled={formData.interests.length === 0}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col h-full"
              >
                <h2 className="text-3xl font-bold mb-2">What are your goals?</h2>
                <p className="text-gray-400 mb-8">Tell us what you want to achieve.</p>
                <textarea 
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                  placeholder="e.g. I want to win a national programming olympiad..."
                />
                <div className="mt-auto pt-8 flex justify-end">
                  <button 
                    onClick={handleComplete}
                    disabled={loading || !formData.goals.trim()}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Finish Setup'} <Check className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
