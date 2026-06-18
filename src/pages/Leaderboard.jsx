import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Award, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('teacher_leaderboard')
          .select('*')
          .order('score', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        setTeachers(data || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  const top3 = teachers.slice(0, 3);
  const others = teachers.slice(3);

  const getMedalColor = (index) => {
    if (index === 0) return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/50';
    if (index === 1) return 'text-gray-300 bg-gray-300/20 border-gray-300/50';
    if (index === 2) return 'text-amber-600 bg-amber-600/20 border-amber-600/50';
    return '';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10 text-accent" />
          Teachers Leaderboard
        </h1>
        <p className="text-gray-400 mt-2">The most active contributors to Mentoria Hub</p>
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
          {/* 2nd Place */}
          {top3[1] && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="order-2 md:order-1 glass-card p-6 text-center border-t-4 border-t-gray-300">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2 mb-4 ${getMedalColor(1)}`}>
                <Medal className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg truncate">{top3[1].full_name || 'Anonymous'}</h3>
              <p className="text-gray-400 text-sm">Score: <span className="font-bold text-white">{top3[1].score}</span></p>
              <div className="mt-4 flex justify-center gap-4 text-xs text-gray-500">
                <span>{top3[1].courses_count} Courses</span>
                <span>{top3[1].olympiads_count} Olympiads</span>
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="order-1 md:order-2 glass-card p-8 text-center border-t-4 border-t-yellow-400 transform md:-translate-y-4">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center border-2 mb-4 ${getMedalColor(0)}`}>
                <Trophy className="w-10 h-10" />
              </div>
              <h3 className="font-bold text-xl truncate">{top3[0].full_name || 'Anonymous'}</h3>
              <p className="text-gray-400 text-sm mt-1">Score: <span className="font-bold text-yellow-400 text-lg">{top3[0].score}</span></p>
              <div className="mt-4 flex justify-center gap-4 text-sm text-gray-400">
                <span>{top3[0].courses_count} Courses</span>
                <span>{top3[0].olympiads_count} Olympiads</span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="order-3 glass-card p-6 text-center border-t-4 border-t-amber-600">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2 mb-4 ${getMedalColor(2)}`}>
                <Award className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg truncate">{top3[2].full_name || 'Anonymous'}</h3>
              <p className="text-gray-400 text-sm">Score: <span className="font-bold text-white">{top3[2].score}</span></p>
              <div className="mt-4 flex justify-center gap-4 text-xs text-gray-500">
                <span>{top3[2].courses_count} Courses</span>
                <span>{top3[2].olympiads_count} Olympiads</span>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Others Table */}
      {others.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-panel overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 font-medium text-gray-400">Rank</th>
                <th className="p-4 font-medium text-gray-400">Name</th>
                <th className="p-4 font-medium text-gray-400 text-center">Courses</th>
                <th className="p-4 font-medium text-gray-400 text-center">Olympiads</th>
                <th className="p-4 font-medium text-accent text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {others.map((teacher, index) => (
                <tr key={teacher.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-gray-500 font-bold">#{index + 4}</td>
                  <td className="p-4 font-medium">{teacher.full_name || 'Anonymous'}</td>
                  <td className="p-4 text-center text-gray-400">{teacher.courses_count}</td>
                  <td className="p-4 text-center text-gray-400">{teacher.olympiads_count}</td>
                  <td className="p-4 text-right font-bold text-accent">{teacher.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {teachers.length === 0 && (
        <div className="text-center text-gray-500 py-12">No teachers on the leaderboard yet.</div>
      )}
    </div>
  );
}
