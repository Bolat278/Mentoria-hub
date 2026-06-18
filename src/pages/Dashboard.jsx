import React, { useEffect, useState } from 'react';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabase';
import { Heart, PlayCircle, Map as MapIcon, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TeacherDashboard from '../components/TeacherDashboard';

export default function Dashboard() {
  const { user, profile } = useUser();
  const [stats, setStats] = useState({ savedCount: 0, coursesCount: 0, roadmapProgress: 0 });
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const { count: savedCount } = await supabase
          .from('saved_opportunities')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: coursesCount } = await supabase
          .from('user_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', true);

        // Fetch roadmap progress (simplified logic: percentage of completed courses out of 5 for now)
        const { count: totalProgressNodes } = await supabase
          .from('user_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        const progressPercentage = Math.min(Math.round(((totalProgressNodes || 0) / 10) * 100), 100);

        setStats({
          savedCount: savedCount || 0,
          coursesCount: coursesCount || 0,
          roadmapProgress: progressPercentage
        });

        // Fetch recommended
        let query = supabase.from('opportunities').select('*').limit(3);
        if (profile?.interests && profile.interests.length > 0) {
          query = query.overlaps('tags', profile.interests);
        }
        const { data: recData } = await query;
        setRecommended(recData || []);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, profile]);

  if (loading) {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  if (profile?.role === 'teacher') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TeacherDashboard user={user} profile={profile} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋</h1>
        <p className="text-gray-400 mt-2">Here is what's happening with your learning journey.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Saved Opportunities</p>
            <p className="text-2xl font-bold">{stats.savedCount}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Courses Completed</p>
            <p className="text-2xl font-bold">{stats.coursesCount}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
            <MapIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-end mb-1">
              <p className="text-gray-400 text-sm">Roadmap Progress</p>
              <span className="text-sm font-bold text-accent">{stats.roadmapProgress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-accent h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.roadmapProgress}%` }} />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <Link to="/catalog" className="text-accent hover:text-white flex items-center gap-1 text-sm font-medium transition-colors">
            View Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommended.length > 0 ? recommended.map(opp => (
            <div key={opp.id} className="glass-panel overflow-hidden group">
              <div className="h-40 bg-gray-800 relative overflow-hidden">
                {opp.image_url ? (
                  <img src={opp.image_url} alt={opp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent/40 to-secondary/40 flex items-center justify-center">
                    <span className="font-bold text-xl uppercase tracking-widest opacity-50">{opp.type}</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-medium border border-white/10 uppercase">
                  {opp.type}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{opp.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{opp.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {opp.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs text-gray-300">
                      {tag}
                    </span>
                  ))}
                  {opp.tags?.length > 2 && <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs text-gray-300">+{opp.tags.length - 2}</span>}
                </div>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xs text-gray-500">
                    Deadline: {new Date(opp.deadline).toLocaleDateString()}
                  </span>
                  <a href={opp.link} target="_blank" rel="noreferrer" className="text-secondary hover:text-white text-sm font-medium">Details</a>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-3 text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-gray-400">No recommendations found yet. Check out the full catalog!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
