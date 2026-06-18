import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabase';
import { BookOpen, Map, Search, Heart, LayoutDashboard, LogOut, Settings, GraduationCap, Trophy, MessageSquare, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, profile } = useUser();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0A0A0F]/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative group-hover:border-accent/50 transition-colors">
                <img src="/logo.png" alt="Mentoria Hub Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">Mentoria <span className="text-accent">Hub</span></span>
            </Link>
          </div>
          
          {user && (
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-baseline space-x-2 lg:space-x-4">
                <Link to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                {profile?.role !== 'teacher' && profile?.role !== 'admin' && (
                  <>
                    <Link to="/catalog" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                      <Search className="w-4 h-4" /> Catalog
                    </Link>
                    <Link to="/courses" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                      <BookOpen className="w-4 h-4" /> Courses
                    </Link>
                    <Link to="/roadmap" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                      <Map className="w-4 h-4" /> Roadmap
                    </Link>
                    <Link to="/favorites" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                      <Heart className="w-4 h-4" /> Favorites
                    </Link>
                  </>
                )}
                <Link to="/messages" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                  <MessageSquare className="w-4 h-4" /> Messages
                </Link>
                <Link to="/leaderboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                  <Trophy className="w-4 h-4 text-yellow-500" /> Leaderboard
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="hidden sm:flex items-center gap-2 text-sm text-secondary hover:text-white border border-secondary/50 px-3 py-1.5 rounded-full transition-colors">
                    <Settings className="w-4 h-4" /> Admin
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-secondary flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-500/20">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <button onClick={handleSignOut} className="hidden sm:block text-gray-400 hover:text-red-400 transition-colors" title="Sign out">
                    <LogOut className="w-5 h-5" />
                  </button>
                  {/* Mobile Menu Toggle */}
                  <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden text-gray-400 hover:text-white transition-colors"
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="btn-primary py-2 px-6 text-sm font-semibold">Sign In</Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-[#0A0A0F]/95 backdrop-blur-xl"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              <Link onClick={() => setMobileMenuOpen(false)} to="/dashboard" className="text-gray-300 hover:text-white block px-3 py-3 rounded-md text-base font-medium flex items-center gap-3">
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </Link>
              {profile?.role !== 'teacher' && profile?.role !== 'admin' && (
                <>
                  <Link onClick={() => setMobileMenuOpen(false)} to="/catalog" className="text-gray-300 hover:text-white block px-3 py-3 rounded-md text-base font-medium flex items-center gap-3">
                    <Search className="w-5 h-5" /> Catalog
                  </Link>
                  <Link onClick={() => setMobileMenuOpen(false)} to="/courses" className="text-gray-300 hover:text-white block px-3 py-3 rounded-md text-base font-medium flex items-center gap-3">
                    <BookOpen className="w-5 h-5" /> Courses
                  </Link>
                  <Link onClick={() => setMobileMenuOpen(false)} to="/roadmap" className="text-gray-300 hover:text-white block px-3 py-3 rounded-md text-base font-medium flex items-center gap-3">
                    <Map className="w-5 h-5" /> Roadmap
                  </Link>
                  <Link onClick={() => setMobileMenuOpen(false)} to="/favorites" className="text-gray-300 hover:text-white block px-3 py-3 rounded-md text-base font-medium flex items-center gap-3">
                    <Heart className="w-5 h-5" /> Favorites
                  </Link>
                </>
              )}
              <Link onClick={() => setMobileMenuOpen(false)} to="/messages" className="text-gray-300 hover:text-white block px-3 py-3 rounded-md text-base font-medium flex items-center gap-3">
                <MessageSquare className="w-5 h-5" /> Messages
              </Link>
              <Link onClick={() => setMobileMenuOpen(false)} to="/leaderboard" className="text-gray-300 hover:text-white block px-3 py-3 rounded-md text-base font-medium flex items-center gap-3">
                <Trophy className="w-5 h-5 text-yellow-500" /> Leaderboard
              </Link>
              <button onClick={() => { setMobileMenuOpen(false); handleSignOut(); }} className="w-full text-left text-red-400 hover:text-red-300 px-3 py-3 rounded-md text-base font-medium flex items-center gap-3">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
