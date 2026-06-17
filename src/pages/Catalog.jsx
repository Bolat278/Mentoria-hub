import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../hooks/useUser';
import SwipeableCard from '../components/SwipeableCard';
import { AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, Filter } from 'lucide-react';

const FILTERS = ['All', 'olympiad', 'internship', 'hackathon', 'scholarship'];

export default function Catalog() {
  const { user } = useUser();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      // Get IDs of already saved/seen opportunities
      const { data: saved } = await supabase
        .from('saved_opportunities')
        .select('opportunity_id')
        .eq('user_id', user.id);
        
      const savedIds = saved?.map(s => s.opportunity_id) || [];

      let query = supabase.from('opportunities').select('*');
      
      if (activeFilter !== 'All') {
        query = query.eq('type', activeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter out already saved (we can keep skipped ones for demo purposes, or create a 'seen' table. For now, filter out saved)
      const unseen = data.filter(opp => !savedIds.includes(opp.id));
      
      // Reverse array so the first element in DOM is the top card (stacking order)
      setOpportunities(unseen.reverse());
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOpportunities();
    }
  }, [user, activeFilter]);

  const handleSwipeRight = async (opportunity) => {
    // Remove from local state
    setOpportunities(prev => prev.filter(o => o.id !== opportunity.id));
    
    // Save to DB
    try {
      await supabase.from('saved_opportunities').insert([{
        user_id: user.id,
        opportunity_id: opportunity.id
      }]);
    } catch (err) {
      console.error('Error saving opportunity:', err);
    }
  };

  const handleSwipeLeft = (opportunity) => {
    // Just remove from local state
    setOpportunities(prev => prev.filter(o => o.id !== opportunity.id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Discover Opportunities</h1>
          <p className="text-gray-400">Swipe right to save, left to skip.</p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === f 
                  ? 'bg-accent text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        ) : opportunities.length > 0 ? (
          <div className="relative w-full max-w-sm h-[500px]">
            <AnimatePresence>
              {opportunities.map((opp, index) => (
                <SwipeableCard
                  key={opp.id}
                  opportunity={opp}
                  onSwipeRight={handleSwipeRight}
                  onSwipeLeft={handleSwipeLeft}
                  style={{ zIndex: index }}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
              <RefreshCw className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">You're all caught up!</h2>
            <p className="text-gray-400 max-w-sm mx-auto">
              There are no new opportunities matching your current filters. Check back later or change your filters.
            </p>
            <button 
              onClick={() => {setActiveFilter('All'); fetchOpportunities();}}
              className="mt-6 text-accent hover:text-white transition-colors font-medium"
            >
              Refresh Catalog
            </button>
          </div>
        )}
      </div>
      
      {/* Action buttons for desktop/accessibility */}
      {opportunities.length > 0 && !loading && (
        <div className="flex justify-center gap-6 mt-8 pb-8">
          <button 
            onClick={() => handleSwipeLeft(opportunities[opportunities.length - 1])}
            className="w-14 h-14 rounded-full bg-white/5 border border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-all hover:scale-110"
          >
            <X className="w-6 h-6" />
          </button>
          <button 
            onClick={() => handleSwipeRight(opportunities[opportunities.length - 1])}
            className="w-14 h-14 rounded-full bg-white/5 border border-green-500/30 flex items-center justify-center text-green-500 hover:bg-green-500/20 transition-all hover:scale-110"
          >
            <Heart className="w-6 h-6 fill-current" />
          </button>
        </div>
      )}
    </div>
  );
}
