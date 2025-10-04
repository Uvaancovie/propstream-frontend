import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Separator } from '../components/ui/separator';
import { 
  Newspaper, 
  Calendar, 
  User, 
  ExternalLink, 
  Inbox,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const NewsInboxPage = () => {
  const { user } = useAuth();
  const [newsletters, setNewsletters] = useState([]);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  useEffect(() => {
    if (user?.role === 'client') {
      fetchNewsletters();
    }
  }, [user, page]);

  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/messages?type=newsletter&page=${page}&pageSize=20`);
      
      if (response.data && response.data.messages) {
        setNewsletters(response.data.messages);
        setPagination({
          total: response.data.total || 0,
          pages: Math.ceil((response.data.total || 0) / 20)
        });
        
        // Auto-select first newsletter if none selected
        if (!selectedNewsletter && response.data.messages.length > 0) {
          setSelectedNewsletter(response.data.messages[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch newsletters:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await api.patch(`/messages/${messageId}`, { read: true });
      setNewsletters(prev => 
        prev.map(msg => 
          msg._id === messageId ? { ...msg, read: true } : msg
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleNewsletterSelect = (newsletter) => {
    setSelectedNewsletter(newsletter);
    if (!newsletter.read) {
      markAsRead(newsletter._id);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (user?.role !== 'client') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <Newspaper className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Only clients can access the newsletter inbox.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Newspaper className="w-8 h-8 text-violet-600" />
          Newsletter Inbox
        </h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with newsletters from realtors you follow
        </p>
      </div>

      <Card className="min-h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-full">
          {/* Newsletter List */}
          <div className="border-r border-border">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold flex items-center gap-2">
                <Inbox className="w-5 h-5" />
                Newsletters ({pagination.total})
              </h3>
            </div>
            
            <div className="overflow-y-auto max-h-[500px]">
              {loading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : newsletters.length === 0 ? (
                <div className="p-6 text-center">
                  <Newspaper className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No newsletters yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Subscribe to realtors on property pages to receive newsletters
                  </p>
                </div>
              ) : (
                newsletters.map(newsletter => (
                  <div
                    key={newsletter._id}
                    onClick={() => handleNewsletterSelect(newsletter)}
                    className={`p-4 cursor-pointer hover:bg-accent transition-colors border-b border-border ${
                      selectedNewsletter?._id === newsletter._id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {newsletter.subject || 'Newsletter'}
                      </h4>
                      {!newsletter.read && (
                        <Badge variant="secondary" className="ml-2 bg-violet-100 text-violet-700 text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      From: {newsletter.fromUserId?.name || newsletter.fromUserId?.email || 'Realtor'}
                    </p>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {truncateText(newsletter.content || newsletter.body || '')}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(newsletter.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    {page} / {pagination.pages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Newsletter Preview */}
          <div className="flex flex-col">
            {selectedNewsletter ? (
              <div className="flex-1 p-6">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedNewsletter.subject || 'Newsletter'}
                  </h2>
                  
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>
                        {selectedNewsletter.fromUserId?.name || 
                         selectedNewsletter.fromUserId?.email || 
                         'Realtor'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedNewsletter.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <Separator className="mb-6" />

                {/* Content */}
                <div className="space-y-6">
                  {/* Newsletter Body */}
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-base leading-relaxed">
                      {selectedNewsletter.body || selectedNewsletter.content}
                    </div>
                  </div>

                  {/* Newsletter Image */}
                  {selectedNewsletter.meta?.imageUrl && (
                    <div className="rounded-lg overflow-hidden border border-border">
                      <img
                        src={selectedNewsletter.meta.imageUrl}
                        alt="Newsletter image"
                        className="w-full max-w-2xl mx-auto h-auto"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Call to Action */}
                  {selectedNewsletter.meta?.cta && (
                    <div className="bg-violet-50 dark:bg-violet-950/20 p-4 rounded-lg border border-violet-200 dark:border-violet-800">
                      <Button
                        onClick={() => window.open(selectedNewsletter.meta.cta.url, '_blank')}
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        {selectedNewsletter.meta.cta.label}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Select a newsletter</h3>
                  <p className="text-muted-foreground">
                    Choose a newsletter from the list to read its content
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NewsInboxPage;