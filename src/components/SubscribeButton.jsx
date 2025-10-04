import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { newsletterAPI } from '../services/api';
import { Button } from './ui/button';
import { MessageCircle, Newspaper } from 'lucide-react';

export default function SubscribeButton({ realtorId, isSubscribedInitial = false }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(isSubscribedInitial);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setIsSubscribed(isSubscribedInitial), [isSubscribedInitial]);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'client') {
      alert('Only clients can subscribe to newsletters');
      return;
    }

    setLoading(true);
    try {
      if (isSubscribed) {
        await newsletterAPI.unsubscribe({ realtorId });
        setIsSubscribed(false);
        setConversationId(null);
      } else {
        const response = await newsletterAPI.subscribe({ realtorId });
        setIsSubscribed(true);
        if (response.conversationId) {
          setConversationId(response.conversationId);
        }
      }
    } catch (error) {
      console.error('Subscribe/unsubscribe error:', error);
      alert(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageRealtor = () => {
    if (conversationId) {
      navigate(`/messages?thread=${conversationId}`);
    } else {
      navigate('/messages');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button 
        onClick={handleSubscribe}
        disabled={loading}
        variant={isSubscribed ? "outline" : "default"}
        className={`${
          isSubscribed 
            ? 'border-violet-600 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/20' 
            : 'bg-violet-600 hover:bg-violet-700 text-white'
        }`}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            Loading...
          </>
        ) : (
          <>
            <Newspaper className="w-4 h-4 mr-2" />
            {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
          </>
        )}
      </Button>

      {isSubscribed && (
        <Button
          onClick={handleMessageRealtor}
          variant="secondary"
          className="bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Message Realtor
        </Button>
      )}
    </div>
  );
}
