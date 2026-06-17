import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('opportunities');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ opportunities: [], courses: [], users: [] });

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'opportunities') {
        const { data: res } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false });
        setData(prev => ({ ...prev, opportunities: res || [] }));
      } else if (tab === 'courses') {
        const { data: res } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
        setData(prev => ({ ...prev, courses: res || [] }));
      } else if (tab === 'users') {
        const { data: res } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        setData(prev => ({ ...prev, users: res || [] }));
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const handleDelete = async (table, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await supabase.from(table).delete().eq('id', id);
      fetchData(activeTab);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      <div className="flex space-x-4 mb-8 border-b border-white/10 pb-4">
        {['opportunities', 'courses', 'users'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="glass-panel p-6">
        {activeTab === 'opportunities' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Manage Opportunities</h2>
              <button className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add New
              </button>
            </div>
            {loading ? <Loader2 className="animate-spin mx-auto text-accent" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="pb-3 font-medium">Title</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Deadline</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.opportunities.map(opp => (
                      <tr key={opp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4">{opp.title}</td>
                        <td className="py-4"><span className="bg-white/10 px-2 py-1 rounded text-xs uppercase">{opp.type}</span></td>
                        <td className="py-4">{new Date(opp.deadline).toLocaleDateString()}</td>
                        <td className="py-4 text-right">
                          <button className="text-secondary hover:text-white mr-3"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete('opportunities', opp.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Manage Courses</h2>
              <button className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add New
              </button>
            </div>
            {loading ? <Loader2 className="animate-spin mx-auto text-accent" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="pb-3 font-medium">Title</th>
                      <th className="pb-3 font-medium">Pause At (sec)</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.courses.map(course => (
                      <tr key={course.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4">{course.title}</td>
                        <td className="py-4">{course.quiz_pause_at_seconds}</td>
                        <td className="py-4 text-right">
                          <button className="text-secondary hover:text-white mr-3"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete('courses', course.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Users Overview</h2>
            {loading ? <Loader2 className="animate-spin mx-auto text-accent" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Grade</th>
                      <th className="pb-3 font-medium">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map(user => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4">{user.full_name || 'N/A'}</td>
                        <td className="py-4">{user.grade || 'N/A'}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-xs uppercase ${user.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-gray-700'}`}>
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
