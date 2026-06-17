import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../hooks/useUser';
import { Loader2, Trash2, ExternalLink, BookmarkX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Favorites() {
  const { user } = useUser();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_opportunities')
        .select(`
          id,
          saved_at,
          opportunities (*)
        `)
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  const handleRemove = async (savedId) => {
    try {
      setFavorites(prev => prev.filter(f => f.id !== savedId));
      await supabase.from('saved_opportunities').delete().eq('id', savedId);
    } catch (err) {
      console.error('Error removing favorite:', err);
      fetchFavorites(); // Revert on error
    }
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Saved Opportunities</h1>
        <p className="text-gray-400">Manage the opportunities you've liked from the catalog.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center">
          <BookmarkX className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No saved opportunities</h2>
          <p className="text-gray-400 mb-6">Head over to the catalog to discover and save opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(({ id: savedId, opportunities: opp }) => (
            <motion.div 
              key={savedId}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-panel overflow-hidden flex flex-col"
            >
              <div className="h-40 bg-gray-800 relative">
                {opp.image_url ? (
                  <img src={opp.image_url} alt={opp.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent/40 to-secondary/40 flex items-center justify-center">
                    <span className="font-bold text-xl uppercase tracking-widest opacity-50">{opp.type}</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-medium border border-white/10 uppercase">
                    {opp.type}
                  </div>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{opp.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{opp.description}</p>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
                  <a 
                    href={opp.link || '#'} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-white transition-colors"
                  >
                    View Details <ExternalLink className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => handleRemove(savedId)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
