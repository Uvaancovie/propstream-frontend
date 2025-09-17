import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import api, { bookingsAPI } from '../services/api';

const AIStudioPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [sendToClient, setSendToClient] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const messagesEndRef = useRef(null);

  // Load user's chat sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const response = await api.get('/ai/sessions');
      // Handle both direct array and wrapped response format
      const sessionData = response.data?.items || response.data || [];
      // Ensure we always have an array
      setSessions(Array.isArray(sessionData) ? sessionData : []);
      setSessionLoading(false);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]); // Set to empty array on error
      setSessionLoading(false);
    }
  };

  // load recent bookings for context / sending to client
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await bookingsAPI.getAll({ realtor: user.id });
        const items = res.items || res || [];
        setBookings(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error('Failed to load bookings for AI Studio', err);
        setBookings([]);
      }
    };
    if (user?.id) loadBookings();
  }, [user]);

  const createNewSession = async () => {
    try {
      const response = await api.post('/ai/sessions', {
        title: `New conversation ${new Date().toLocaleString()}`
      });
      
      // Check if response has the expected structure
      const newSession = response.data?.session || response.data;
      
      if (!newSession || !newSession._id) {
        throw new Error('Invalid session response from server');
      }
      
      // Ensure sessions is always an array before spreading
      setSessions(prev => [newSession, ...(Array.isArray(prev) ? prev : [])]);
      setActiveSession(newSession);
      setMessages([]);
    } catch (error) {
      console.error('Error creating session:', error);
      // Show user-friendly error message
      alert('Failed to create new conversation. Please try again.');
    }
  };

  const loadSession = async (session) => {
    setActiveSession(session);
    try {
      const response = await api.get(`/ai/sessions/${session._id}/messages`);
      // Handle the wrapped response format
      const messagesData = response.data?.messages || response.data || [];
      // Convert backend message format to frontend format
      const formattedMessages = messagesData.map(msg => ({
        role: msg.role,
        message: msg.content,
        createdAt: msg.createdAt
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const deleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      await api.delete(`/ai/sessions/${sessionId}`);
      setSessions(sessions.filter(s => s._id !== sessionId));
      if (activeSession?._id === sessionId) {
        setActiveSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const updateSessionTitle = async (sessionId, newTitle) => {
    try {
      await api.patch(`/ai/sessions/${sessionId}`, { title: newTitle });
      setSessions(sessions.map(s => 
        s._id === sessionId ? { ...s, title: newTitle } : s
      ));
      if (activeSession?._id === sessionId) {
        setActiveSession({ ...activeSession, title: newTitle });
      }
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeSession || loading) return;

    // Safety check: ensure activeSession has a valid _id
    if (!activeSession._id) {
      console.error('No valid session ID found');
      alert('Please create a new conversation first.');
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Add user message to UI immediately
    const newUserMessage = {
      role: 'user',
      message: userMessage,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await api.post(`/ai/sessions/${activeSession._id}/messages`, {
        content: userMessage,
        sendToClient: sendToClient,
        bookingId: sendToClient && selectedBooking ? selectedBooking._id : undefined,
        clientId: sendToClient && selectedBooking ? selectedBooking.client_id : undefined
      });

      // Add AI response - handle the correct response format
      const aiMessage = {
        role: 'assistant',
        message: response.data?.message?.content || response.data?.response || 'No response received',
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Update session title if it's a new conversation
      if (activeSession.title.startsWith('New conversation') && sessions.length > 0) {
        const updatedTitle = response.data.suggestedTitle || userMessage.slice(0, 50) + '...';
        updateSessionTitle(activeSession._id, updatedTitle);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      // Show backend error body if available
      console.error('Backend response data:', error.response?.data);
      const serverMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      // Remove the optimistic user message on error
      setMessages(prev => prev.slice(0, -1));
      alert(`Failed to send: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Chat Sessions */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">AI Studio</h1>
            <Badge variant="secondary">Beta</Badge>
          </div>
          <Button 
            onClick={createNewSession} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            + New Conversation
          </Button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4">
          {sessionLoading ? (
            <div className="text-center text-gray-500 mt-8">
              Loading conversations...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>No conversations yet.</p>
              <p className="text-sm mt-2">Start a new chat to begin!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Array.isArray(sessions) && sessions.map((session) => (
                <div
                  key={session._id}
                  className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                    activeSession?._id === session._id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => loadSession(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {session.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(session.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session._id);
                      }}
                      className="ml-2 text-gray-400 hover:text-red-500 text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeSession ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {activeSession.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    AI Assistant • Powered by Cohere
                  </p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Online
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-16">
                  <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
                    <h3 className="font-medium text-blue-900 mb-2">
                      Welcome to AI Studio!
                    </h3>
                    <p className="text-sm text-blue-700">
                      I'm your AI assistant, ready to help with property questions,
                      market insights, client communications, and more. Ask me anything!
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.message}</p>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-900 border border-gray-200 max-w-2xl px-4 py-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about properties, market trends, client questions..."
                  className="flex-1"
                  disabled={loading}
                />
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm">Send to client</label>
                    <input type="checkbox" checked={sendToClient} onChange={(e) => setSendToClient(e.target.checked)} />
                  </div>
                  {sendToClient && (
                    <select className="input" value={selectedBooking?._id || ''} onChange={(e) => setSelectedBooking(bookings.find(b => b._id === e.target.value) || null)}>
                      <option value="">Select booking</option>
                      {bookings.map(b => (
                        <option key={b._id} value={b._id}>{b.property_name} — {new Date(b.check_in).toLocaleDateString()} — {b.guest_name}</option>
                      ))}
                    </select>
                  )}
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </>
        ) : (
          // No session selected
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 max-w-md">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome to AI Studio
                </h3>
                <p className="text-gray-600 mb-4">
                  Start a new conversation to chat with your AI assistant about 
                  properties, clients, and real estate insights.
                </p>
                <Button 
                  onClick={createNewSession}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start New Conversation
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIStudioPage;
