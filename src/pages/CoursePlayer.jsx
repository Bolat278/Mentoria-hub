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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!user) return;
      
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
          .maybeSingle();
          
        if (progress?.completed) {
          setCompleted(true);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.message || 'Failed to load course. Please try again later.');
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

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-xl max-w-md text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Course</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link to="/courses" className="btn-primary inline-block">Back to Courses</Link>
        </div>
      </div>
    );
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
        {course.video_url ? (
          <VideoQuizPlayer
            videoUrl={course.video_url}
            quizQuestion={course.quiz_question || "What is the main topic discussed so far?"}
            quizOptions={course.quiz_options || ["Option A", "Option B", "Option C", "Option D"]}
            correctIndex={course.quiz_correct_index || 0}
            pauseAtSeconds={course.quiz_pause_at_seconds || 10}
            onQuizPassed={handleQuizPassed}
          />
        ) : (
          <div className="w-full aspect-video bg-black/40 rounded-2xl flex flex-col items-center justify-center border border-white/10">
            <h3 className="text-xl font-bold mb-4">Course Video Pending</h3>
            <button onClick={handleQuizPassed} className="btn-primary">Mark as Completed</button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel p-6">
          <h3 className="text-xl font-bold mb-4">Конспект и введение (Course Notes)</h3>
          <div className="prose prose-invert max-w-none text-gray-300">
            <p>{course.description}</p>
            {course.file_url ? (
              <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white mb-1">Дополнительные материалы</h4>
                  <p className="text-sm text-gray-400">Скачайте файл с дополнительной информацией по курсу.</p>
                </div>
                <a href={course.file_url} target="_blank" rel="noreferrer" className="btn-primary py-2 px-4 whitespace-nowrap">
                  Открыть файл
                </a>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-sm text-gray-400">К этому уроку файлы пока не прикреплены.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {course.tags?.map(tag => (
              <span key={tag} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-gray-300">
                {tag}
              </span>
            ))}
            {(!course.tags || course.tags.length === 0) && (
              <span className="text-gray-500 text-sm">No tags</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
