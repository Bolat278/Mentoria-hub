import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUser } from '../hooks/useUser';
import VideoQuizPlayer from '../components/VideoQuizPlayer';
import { ArrowLeft, Loader2, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CoursePlayer() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
        if (error) throw error;
        setCourse(data);

        // Check if already completed
        const { data: progress } = await supabase
          .from('user_progress')
          .select('completed')
          .eq('user_id', user.id)
          .eq('course_id', id)
          .single();
          
        if (progress?.completed) {
          setCompleted(true);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user, navigate]);

  const handleQuizPassed = async () => {
    if (completed) return; // Already saved

    try {
      // Upsert progress
      const { error } = await supabase.from('user_progress').upsert({
        user_id: user.id,
        course_id: id,
        completed: true,
        quiz_passed: true,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,course_id' });

      if (error) throw error;
      setCompleted(true);
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  if (!course) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-gray-400">{course.description}</p>
          </div>
          {completed && (
            <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-xl border border-green-500/30">
              <Award className="w-5 h-5" />
              <span className="font-medium text-sm hidden sm:inline">Completed</span>
            </div>
          )}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <VideoQuizPlayer
          videoUrl={course.video_url}
          quizQuestion={course.quiz_question || "What is the main topic discussed so far?"}
          quizOptions={course.quiz_options || ["Option A", "Option B", "Option C", "Option D"]}
          correctIndex={course.quiz_correct_index || 0}
          pauseAtSeconds={course.quiz_pause_at_seconds || 10}
          onQuizPassed={handleQuizPassed}
        />
      </motion.div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-bold mb-4">Course Material & Tags</h3>
        <div className="flex flex-wrap gap-2">
          {course.tags?.map(tag => (
            <span key={tag} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-gray-300">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
