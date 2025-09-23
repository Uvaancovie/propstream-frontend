import React, { useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]); // grouped by conversation partner or booking
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesRef = useRef(null);

  const idOf = (u) => (typeof u === 'object' ? String(u._id || u) : String(u));
  const backendOrigin = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');
  const resolveImage = (img) => {
    if (!img) return null;
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    if (img.startsWith('/')) return `${backendOrigin}${img}`;
    return `${backendOrigin}/${img}`;
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // scroll to bottom when active thread or threads update
  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [activeThread, threads]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await messagesAPI.getAll();
      const msgs = res.messages || res;

      // Group messages by conversation key (booking_id || other user id pair)
      const groups = {};
      msgs.forEach(m => {
        const senderId = typeof m.sender_id === 'object' ? String(m.sender_id._id || m.sender_id) : String(m.sender_id);
        const receiverId = typeof m.receiver_id === 'object' ? String(m.receiver_id._id || m.receiver_id) : String(m.receiver_id);
        const otherUser = senderId === user.id ? receiverId : senderId;
        const key = `${m.booking_id || 'nobooking'}::${otherUser}`;
        if (!groups[key]) groups[key] = { key, otherUser, booking_id: m.booking_id, messages: [] };
        groups[key].messages.push(m);
      });

      // For each group, sort messages chronologically (oldest -> newest)
      Object.values(groups).forEach(g => {
        g.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });

      const grouped = Object.values(groups).map(g => ({
        ...g,
        lastMessage: g.messages[g.messages.length - 1]
      })).sort((a,b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

      setThreads(grouped);
      // auto-select first thread
      if (grouped.length) setActiveThread(grouped[0]);
    } catch (err) {
      console.error('Error loading messages:', err);
      toast.error('Failed to load messages');
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  const openThread = (thread) => {
    setActiveThread(thread);
  };

  const handleSend = async (e) => {
    e && e.preventDefault();
    if (!newMessage.trim()) return toast.error('Message cannot be empty');
    if (!activeThread) return toast.error('Select a thread first');

    try {
      const payload = {
        receiver_id: activeThread.otherUser,
        content: newMessage,
        booking_id: activeThread.booking_id
      };

      await messagesAPI.create(payload);
      setNewMessage('');
      await loadMessages();
      toast.success('Message sent');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-1">
        <h2 className="text-xl font-semibold mb-4">Conversations</h2>
        {threads.length === 0 ? (
          <div className="text-gray-500">No conversations yet.</div>
        ) : (
          <div className="space-y-2">
            {threads.map(t => (
              <button
                key={t.key}
                onClick={() => openThread(t)}
                className={`w-full text-left p-3 rounded border ${activeThread?.key === t.key ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                      {/* show avatar of other user when available */}
                      {(() => {
                        const msg = t.messages[0];
                        const senderId = typeof msg.sender_id === 'object' ? String(msg.sender_id._id || msg.sender_id) : String(msg.sender_id);
                        const other = senderId === user.id ? msg.receiver_id : msg.sender_id;
                        const img = other && other.profileImage ? other.profileImage : null;
                        return img ? <img src={img.startsWith('/') ? `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/api\/?$/,'')}${img}` : img} alt="avatar" className="w-full h-full object-cover" /> : <div className="text-xs text-gray-500 flex items-center justify-center">U</div>;
                      })()}
                    </div>
                    <div>
                      <div className="font-medium">{(() => {
                        const msg = t.messages[0];
                        const senderId = typeof msg.sender_id === 'object' ? String(msg.sender_id._id || msg.sender_id) : String(msg.sender_id);
                        const other = senderId === user.id ? msg.receiver_id : msg.sender_id;
                        return other && other.name ? other.name : (other && other.email ? other.email : 'User');
                      })()}</div>
                      <div className="text-sm text-gray-600 truncate">{t.lastMessage.content}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{new Date(t.lastMessage.createdAt).toLocaleString()}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="col-span-2">
        {!activeThread ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Conversation</h2>
            <div className="text-gray-500">Select a conversation to view messages.</div>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-9rem)] border rounded bg-slate-900">
            {/* Conversation header */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                {(() => {
                  const msg = activeThread.messages[0];
                  const senderId = idOf(msg.sender_id);
                  const other = senderId === user.id ? msg.receiver_id : msg.sender_id;
                  const img = other && other.profileImage ? other.profileImage : null;
                  const src = img && img.startsWith('/') ? `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/api\/?$/,'')}${img}` : img;
                  return src ? <img src={src} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">U</div>;
                })()}
              </div>
              <div>
                <div className="text-white font-semibold">{(() => {
                  const msg = activeThread.messages[0];
                  const senderId = idOf(msg.sender_id);
                  const other = senderId === user.id ? msg.receiver_id : msg.sender_id;
                  return other && other.name ? other.name : (other && other.email ? other.email : 'User');
                })()}</div>
                <div className="text-xs text-slate-400">{activeThread.messages.length} messages</div>
              </div>
            </div>

            {/* Messages */}
            <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeThread.messages.map(msg => {
                const senderId = typeof msg.sender_id === 'object' ? String(msg.sender_id._id || msg.sender_id) : String(msg.sender_id);
                const mine = senderId === user.id;
                const senderObj = typeof msg.sender_id === 'object' ? msg.sender_id : null;
                const avatar = senderObj?.profileImage ? resolveImage(senderObj.profileImage) : null;
                return (
                  <div key={msg._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    {!mine && (
                      <div className="w-10 mr-3 flex-shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">U</div>}
                        </div>
                      </div>
                    )}

                    <div className={`max-w-[80%] p-3 rounded-lg ${mine ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-200'}`}>
                      {!mine && senderObj && (
                        <div className="text-xs text-slate-400 mb-1 font-medium">{senderObj.name || senderObj.email}</div>
                      )}
                      <div className="text-sm leading-relaxed">{msg.content}</div>
                      <div className="text-xs text-slate-400 mt-1 text-right">{new Date(msg.createdAt).toLocaleString()}</div>
                    </div>

                    {mine && (
                      <div className="w-10 ml-3 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Input area (sticky) */}
            <div className="p-3 border-t border-slate-800 bg-slate-900">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 rounded bg-slate-800 border border-slate-700 px-4 py-2 text-white"
                  placeholder="Write a message..."
                />
                <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded">Send</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
