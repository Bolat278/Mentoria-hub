import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Upload, Trophy, Trash2, Plus, Loader2 } from 'lucide-react';

export default function TeacherDashboard({ user, profile }) {
  const [courses, setCourses] = useState([]);
  const [olympiads, setOlympiads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [uploading, setUploading] = useState(false);
  const [activeForm, setActiveForm] = useState(null); // 'course' | 'olympiad' | null
  
  // Course form
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseFile, setCourseFile] = useState(null);

  // Olympiad form
  const [olyTitle, setOlyTitle] = useState('');
  const [olySubject, setOlySubject] = useState('');
  const [olyDate, setOlyDate] = useState('');
  const [olyFile, setOlyFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const { data: coursesData } = await supabase.from('courses').select('*').eq('teacher_id', user.id);
    const { data: olympiadsData } = await supabase.from('olympiads').select('*').eq('teacher_id', user.id);
    setCourses(coursesData || []);
    setOlympiads(olympiadsData || []);
    setLoading(false);
  };

  const handleFileUpload = async (file, bucket) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    const { error: uploadError, data } = await supabase.storage.from(bucket).upload(filePath, file);
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrl;
  };

  const handleUploadCourse = async (e) => {
    e.preventDefault();
    if (!courseFile) return;
    setUploading(true);
    try {
      const fileUrl = await handleFileUpload(courseFile, 'courses');
      await supabase.from('courses').insert([{
        teacher_id: user.id,
        title: courseTitle,
        description: courseDesc,
        file_url: fileUrl,
        file_type: courseFile.type
      }]);
      setActiveForm(null);
      setCourseTitle(''); setCourseDesc(''); setCourseFile(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadOlympiad = async (e) => {
    e.preventDefault();
    if (!olyFile) return;
    setUploading(true);
    try {
      const fileUrl = await handleFileUpload(olyFile, 'olympiads');
      await supabase.from('olympiads').insert([{
        teacher_id: user.id,
        title: olyTitle,
        subject: olySubject,
        event_date: olyDate,
        file_url: fileUrl,
      }]);
      setActiveForm(null);
      setOlyTitle(''); setOlySubject(''); setOlyDate(''); setOlyFile(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure?')) return;
    await supabase.from(type).delete().eq('id', id);
    fetchData();
  };

  if (loading) {
    return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Teacher Dashboard</h2>
        <div className="flex gap-4">
          <button onClick={() => setActiveForm(activeForm === 'course' ? null : 'course')} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Course
          </button>
          <button onClick={() => setActiveForm(activeForm === 'olympiad' ? null : 'olympiad')} className="bg-secondary text-white px-4 py-2 rounded-xl hover:bg-secondary/90 transition-colors flex items-center gap-2 text-sm font-medium">
            <Plus className="w-4 h-4" /> Olympiad
          </button>
        </div>
      </div>

      {/* Forms */}
      {activeForm === 'course' && (
        <form onSubmit={handleUploadCourse} className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-bold">Upload Course</h3>
          <input type="text" required placeholder="Course Title" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
          <textarea placeholder="Description" value={courseDesc} onChange={e => setCourseDesc(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white h-24" />
          <input type="file" required accept=".pdf,.docx,.pptx,.mp4,.zip,.xlsx" onChange={e => setCourseFile(e.target.files[0])} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-gray-400" />
          <button type="submit" disabled={uploading} className="btn-primary w-full flex justify-center">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload Course'}
          </button>
        </form>
      )}

      {activeForm === 'olympiad' && (
        <form onSubmit={handleUploadOlympiad} className="glass-panel p-6 space-y-4 border-secondary/50">
          <h3 className="text-lg font-bold">Upload Olympiad</h3>
          <input type="text" required placeholder="Olympiad Title" value={olyTitle} onChange={e => setOlyTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
          <input type="text" required placeholder="Subject / Category" value={olySubject} onChange={e => setOlySubject(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
          <input type="date" required value={olyDate} onChange={e => setOlyDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white" />
          <input type="file" required accept=".pdf,.docx" onChange={e => setOlyFile(e.target.files[0])} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-gray-400" />
          <button type="submit" disabled={uploading} className="bg-secondary text-white px-4 py-3 rounded-xl hover:bg-secondary/90 transition-colors w-full font-bold flex justify-center">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload Olympiad'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-accent" /> My Courses</h3>
          <div className="space-y-4">
            {courses.length === 0 ? <p className="text-gray-400">No courses uploaded yet.</p> : courses.map(c => (
              <div key={c.id} className="glass-card p-4 flex justify-between items-start">
                <div>
                  <h4 className="font-bold">{c.title}</h4>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{c.description}</p>
                  <a href={c.file_url} target="_blank" rel="noreferrer" className="text-accent text-sm mt-2 inline-block">View File</a>
                </div>
                <button onClick={() => handleDelete(c.id, 'courses')} className="text-red-400 hover:text-red-300 p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-secondary" /> My Olympiads</h3>
          <div className="space-y-4">
            {olympiads.length === 0 ? <p className="text-gray-400">No olympiads uploaded yet.</p> : olympiads.map(o => (
              <div key={o.id} className="glass-card p-4 flex justify-between items-start border border-white/5">
                <div>
                  <h4 className="font-bold">{o.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{o.subject} • {o.event_date}</p>
                  <a href={o.file_url} target="_blank" rel="noreferrer" className="text-secondary text-sm mt-2 inline-block">View Task File</a>
                </div>
                <button onClick={() => handleDelete(o.id, 'olympiads')} className="text-red-400 hover:text-red-300 p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
