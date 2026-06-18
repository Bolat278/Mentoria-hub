import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '../hooks/useUser';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Messages() {
  const { user, profile } = useUser();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const isTeacher = profile?.role === 'teacher';

  useEffect(() => {
    if (!user) return;
    
    // Fetch contacts (opposite role)
    const fetchContacts = async () => {
      const targetRole = isTeacher ? 'student' : 'teacher';
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', targetRole);
        
      if (!error && data) {
        setContacts(data);
      }
      setLoading(false);
    };

    fetchContacts();
  }, [user, isTeacher]);

  useEffect(() => {
    if (!user || !activeContact) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeContact.id}),and(sender_id.eq.${activeContact.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
      scrollToBottom();
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        if (payload.new.sender_id === activeContact.id) {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeContact]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    const msg = {
      sender_id: user.id,
      receiver_id: activeContact.id,
      content: newMessage.trim()
    };

    // Optimistic UI update
    setMessages(prev => [...prev, { ...msg, id: Date.now().toString(), created_at: new Date().toISOString() }]);
    setNewMessage('');
    scrollToBottom();

    const { error } = await supabase.from('messages').insert([msg]);
    if (error) {
      console.error('Error sending message:', error);
      // Ideally remove optimistic message on error, but simple for now
    }
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-accent" />
          Feedback & Messages
        </h1>
        <p className="text-gray-400 mt-2">
          {isTeacher ? 'Communicate with your students and give feedback.' : 'Reach out to teachers for help and feedback.'}
        </p>
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col md:flex-row">
        {/* Contacts Sidebar */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-white/10 flex flex-col overflow-y-auto bg-black/20">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-bold text-gray-300 uppercase tracking-wider text-sm">
              {isTeacher ? 'Students' : 'Teachers'}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No {isTeacher ? 'students' : 'teachers'} found.</p>
            ) : (
              contacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setActiveContact(contact)}
                  className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                    activeContact?.id === contact.id ? 'bg-accent/20 border-l-4 border-accent' : 'hover:bg-white/5 border-l-4 border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold">{contact.full_name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-400 capitalize">{contact.role}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-black/10">
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-black/20">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">{activeContact.full_name || 'Anonymous'}</h3>
                  <p className="text-xs text-accent capitalize">{activeContact.role}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id} 
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[75%] p-3 rounded-2xl ${
                          isMe 
                            ? 'bg-accent text-white rounded-br-sm' 
                            : 'bg-white/10 text-gray-200 rounded-bl-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1 px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-white/10 bg-black/20 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="btn-primary p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">Select a contact to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
