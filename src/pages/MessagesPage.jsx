import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await messagesAPI.getAll();
      const msgs = res.messages || res;

      // Group messages by conversation key (booking_id || other user id pair)
      const groups = {};
      msgs.forEach(m => {
        const otherUser = m.sender_id === user.id ? m.receiver_id : m.sender_id;
        const key = `${m.booking_id || 'nobooking'}::${otherUser}`;
        if (!groups[key]) groups[key] = { key, otherUser, booking_id: m.booking_id, messages: [] };
        groups[key].messages.push(m);
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
                <div className="font-medium">User: {t.otherUser}</div>
                <div className="text-sm text-gray-600 truncate">{t.lastMessage.content}</div>
                <div className="text-xs text-gray-400">{new Date(t.lastMessage.createdAt).toLocaleString()}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="col-span-2">
        <h2 className="text-xl font-semibold mb-4">Conversation</h2>
        {!activeThread ? (
          <div className="text-gray-500">Select a conversation to view messages.</div>
        ) : (
          <div className="flex flex-col h-[60vh] border rounded">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeThread.messages.map(msg => (
                <div key={msg._id} className={`p-3 rounded ${msg.sender_id === user.id ? 'bg-blue-50 self-end' : 'bg-gray-100 self-start'}`}>
                  <div className="text-sm text-gray-800">{msg.content}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-3 border-t flex space-x-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 input"
                placeholder="Write a message..."
              />
              <button type="submit" className="btn btn-primary">Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
