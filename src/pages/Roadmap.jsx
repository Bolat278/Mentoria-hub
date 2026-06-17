import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../hooks/useUser';
import RoadmapNode from '../components/RoadmapNode';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Roadmap() {
  const { user } = useUser();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const { data: coursesData } = await supabase.from('courses').select('*').order('created_at', { ascending: true });
        
        let progressData = [];
        if (user) {
          const { data } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id);
          progressData = data || [];
        }

        if (coursesData) {
          let currentFound = false;
          
          const mappedNodes = coursesData.map((course, index) => {
            const p = progressData.find(p => p.course_id === course.id);
            let status = 'locked';
            
            if (p?.completed) {
              status = 'completed';
            } else if (!currentFound && (index === 0 || progressData.find(p => p.course_id === coursesData[index - 1].id)?.completed)) {
              status = 'current';
              currentFound = true;
            }

            return {
              id: course.id,
              title: course.title,
              status
            };
          });
          
          setNodes(mappedNodes);
        }
      } catch (err) {
        console.error('Error fetching roadmap:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [user]);

  if (loading) {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Your Skill Roadmap</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Complete courses to unlock new stages. Watch your progress grow as you master new skills.
        </p>
      </div>

      <div className="relative py-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          {nodes.map((node, index) => (
            <RoadmapNode
              key={node.id}
              title={node.title}
              status={node.status}
              index={index}
              isLast={index === nodes.length - 1}
            />
          ))}
          
          {nodes.length === 0 && (
            <div className="text-gray-500 text-center py-12">
              No roadmap nodes available. Admins need to add courses.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
