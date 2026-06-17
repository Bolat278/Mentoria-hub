import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Play, CheckCircle, Lock, Loader2 } from 'lucide-react';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data: coursesData } = await supabase.from('courses').select('*').order('created_at', { ascending: true });
        
        // Fetch user progress
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id);
          setProgress(progressData || []);
        }
        
        setCourses(coursesData || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getCourseStatus = (courseId, index) => {
    const p = progress.find(p => p.course_id === courseId);
    if (p?.completed) return 'completed';
    
    // Simplistic unlock logic: unlock first course by default, or if previous course is completed
    if (index === 0) return 'available';
    const prevCourseId = courses[index - 1]?.id;
    const prevP = progress.find(p => p.course_id === prevCourseId);
    if (prevP?.completed) return 'available';
    
    return 'locked';
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Video Courses</h1>
        <p className="text-gray-400">Master new skills to unlock roadmap nodes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => {
          const status = getCourseStatus(course.id, index);
          
          return (
            <div key={course.id} className={`glass-panel overflow-hidden relative ${status === 'locked' ? 'opacity-75 grayscale' : ''}`}>
              <div className="h-48 bg-gray-800 relative">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1E1E2E] to-[#2D2D3E] flex items-center justify-center">
                    <Play className="w-12 h-12 text-gray-600" />
                  </div>
                )}
                
                {/* Status Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  {status === 'completed' && <div className="bg-green-500/90 text-white rounded-full p-2 backdrop-blur-sm"><CheckCircle className="w-8 h-8" /></div>}
                  {status === 'locked' && <div className="bg-black/60 text-white rounded-full p-4 backdrop-blur-md"><Lock className="w-8 h-8" /></div>}
                  {status === 'available' && <div className="w-16 h-16 rounded-full bg-accent/80 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-purple-500/50"><Play className="w-8 h-8 ml-1" /></div>}
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.tags?.map(tag => (
                    <span key={tag} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs text-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>
                
                {status === 'locked' ? (
                  <button disabled className="w-full py-2 rounded-lg bg-white/5 text-gray-500 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                    <Lock className="w-4 h-4" /> Locked
                  </button>
                ) : (
                  <Link to={`/courses/${course.id}`} className={`w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${status === 'completed' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-accent hover:bg-purple-600 text-white'}`}>
                    {status === 'completed' ? 'Review Course' : 'Start Course'} <Play className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
