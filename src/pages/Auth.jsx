import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GraduationCap, Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignIn) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        
        // Check if profile exists and has grade setup
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        
        if (!profile || !profile.grade) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        const { error: signUpError, data } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        
        // Auto-create basic profile
        if (data?.user) {
          await supabase.from('profiles').insert([{ id: data.user.id, role }]);
        }
        
        navigate('/onboarding');
      }
    } catch (err) {
      console.error("Auth error:", err);
      let errorMsg = err.message || "Произошла неизвестная ошибка";
      
      const lowerError = errorMsg.toLowerCase();
      if (errorMsg === '{}' || errorMsg === '[object Object]') {
        errorMsg = "Ошибка сервера (Сбой отправки письма). Разработчику: проверьте настройки SMTP в Supabase.";
      } else if (lowerError.includes('email rate limit')) {
        errorMsg = "Слишком много попыток. Подождите 1 час или отключите 'Confirm Email' в Supabase.";
      } else if (lowerError.includes('email not confirmed')) {
        errorMsg = "Почта не подтверждена. Разработчику: отключите 'Confirm Email' в настройках Supabase (Authentication -> Providers -> Email).";
      } else if (lowerError.includes('invalid login credentials')) {
        errorMsg = "Неверный email или пароль.";
      } else if (lowerError.includes('user already registered')) {
        errorMsg = "Пользователь с таким email уже существует.";
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-4 text-accent">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold">Welcome to Mentoria Hub</h2>
          <p className="text-gray-400 mt-2 text-center">
            {isSignIn ? 'Sign in to continue your journey' : 'Create an account to get started'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isSignIn && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Я регистрируюсь как:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-3 rounded-xl border transition-all ${
                    role === 'student'
                      ? 'bg-accent/20 border-accent text-accent'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Ученик
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`py-3 rounded-xl border transition-all ${
                    role === 'teacher'
                      ? 'bg-accent/20 border-accent text-accent'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Учитель
                </button>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Mail className="w-5 h-5" />
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Lock className="w-5 h-5" />
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary mt-6 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignIn ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          {isSignIn ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsSignIn(!isSignIn)} 
            className="text-accent hover:text-white font-medium transition-colors"
          >
            {isSignIn ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
