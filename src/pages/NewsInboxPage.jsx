import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Avatar } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { 
  Newspaper, 
  Calendar, 
  User, 
  ExternalLink, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  MapPin
} from 'lucide-react';

const NewsInboxPage = () => {
  const { user } = useAuth();
  const [newsletters, setNewsletters] = useState([]);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentNewsletter, setCurrentNewsletter] = useState(null);

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
      await api.put(`/messages/${messageId}/read`);
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

  const openDetails = (newsletter) => {
    setCurrentNewsletter(newsletter);
    setDetailsOpen(true);
    if (!newsletter.read) {
      markAsRead(newsletter._id);
    }
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
    <div className="min-h-screen bg-slate-950">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-b border-violet-500/20">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Your News Feed</h1>
              <p className="text-violet-100 mt-1">
                Latest updates from realtors you follow • {pagination.total} posts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feed Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filter Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200">
              <Filter className="w-4 h-4 mr-2" />
              All Posts
            </Button>
          </div>
          
          {!loading && newsletters.length > 0 && (
            <p className="text-sm text-slate-400">
              Showing {newsletters.length} of {pagination.total} newsletters
            </p>
          )}
        </div>

        {/* Newsletter Feed */}
        <div className="space-y-6">
          {loading ? (
            // Loading Skeletons
            [...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden bg-slate-900 border-slate-800">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="w-12 h-12 rounded-full bg-slate-800" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2 bg-slate-800" />
                      <Skeleton className="h-3 w-24 bg-slate-800" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-3 bg-slate-800" />
                  <Skeleton className="h-4 w-full mb-2 bg-slate-800" />
                  <Skeleton className="h-4 w-full mb-2 bg-slate-800" />
                  <Skeleton className="h-4 w-2/3 mb-4 bg-slate-800" />
                  <Skeleton className="h-48 w-full rounded-xl bg-slate-800" />
                </div>
              </Card>
            ))
          ) : newsletters.length === 0 ? (
            // Empty State
            <Card className="text-center py-16 bg-slate-900 border-slate-800">
              <div className="max-w-md mx-auto">
                <div className="mb-6 relative">
                  <div className="inline-block p-6 bg-gradient-to-br from-violet-950/40 to-purple-950/40 rounded-3xl border border-violet-800/30">
                    <Newspaper className="w-16 h-16 text-violet-400" />
                  </div>
                  <div className="absolute top-0 right-1/3 animate-bounce">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-white">Your feed is empty</h3>
                <p className="text-slate-400 mb-6">
                  Subscribe to realtors on property pages to start receiving their latest news and updates
                </p>
                
                <Button 
                  onClick={() => window.location.href = '/browse'}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Browse Properties
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          ) : (
            // Newsletter Cards
            newsletters.map((newsletter) => (
              <Card 
                key={newsletter._id} 
                className="overflow-hidden bg-slate-900 border-slate-800 hover:border-violet-700 transition-all duration-300 hover:shadow-xl hover:shadow-violet-900/20"
                onClick={() => !newsletter.read && markAsRead(newsletter._id)}
              >
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-violet-700">
                        <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                          {(newsletter.fromUserId?.name || 'R')[0].toUpperCase()}
                        </div>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base text-white">
                            {newsletter.fromUserId?.name || newsletter.fromUserId?.email || 'Realtor'}
                          </h3>
                          {!newsletter.read && (
                            <Badge className="bg-violet-600/30 text-violet-300 hover:bg-violet-600/30 text-xs px-2 py-0 border border-violet-500">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(newsletter.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post Title */}
                  <h2 className="text-2xl font-bold mb-3 text-white">
                    {newsletter.subject || 'Newsletter Update'}
                  </h2>

                  {/* Post Content - Truncated Preview */}
                  <div className="prose prose-invert max-w-none mb-4">
                    <p className="text-base leading-relaxed text-slate-300">
                      {truncateText(newsletter.body || newsletter.content, 200)}
                    </p>
                  </div>

                  {/* View Details Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetails(newsletter);
                    }}
                    variant="outline"
                    className="mb-4 border-violet-700 text-violet-400 hover:bg-violet-950/30 hover:text-violet-300"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Details
                  </Button>
                </div>

                {/* Preview Image - Smaller */}
                {newsletter.meta?.imageUrl && (
                  <div className="px-6 pb-4">
                    <div className="rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 max-h-[180px]">
                      <img
                        src={newsletter.meta.imageUrl}
                        alt="Newsletter preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.parentElement.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Call to Action Preview */}
                {newsletter.meta?.cta && (
                  <div className="px-6 pb-6">
                    <div className="bg-gradient-to-r from-violet-950/40 to-purple-950/40 p-3 rounded-xl border border-violet-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <MapPin className="w-4 h-4 text-violet-400" />
                          <span className="font-medium">{newsletter.meta.cta.label}</span>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(newsletter.meta.cta.url, '_blank');
                          }}
                          size="sm"
                          className="bg-violet-600 hover:bg-violet-700 text-white"
                        >
                          View Property
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <Card className="inline-flex items-center gap-2 p-2 bg-slate-900 border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full hover:bg-slate-800 text-slate-300"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1 px-2">
                {[...Array(pagination.pages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show first, last, current, and adjacent pages
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.pages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={`rounded-full w-9 h-9 p-0 ${
                          pageNum === page 
                            ? 'bg-violet-600 hover:bg-violet-700 text-white' 
                            : 'hover:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return <span key={pageNum} className="text-slate-600 px-1">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="rounded-full hover:bg-slate-800 text-slate-300"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Card>
          </div>
        )}

        {/* Bottom Spacer */}
        <div className="h-12" />
      </div>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent onClose={() => setDetailsOpen(false)}>
          {currentNewsletter && (
            <div className="max-h-[85vh] overflow-y-auto">
              {/* Modal Header */}
              <DialogHeader className="sticky top-0 bg-slate-900 z-10 border-b border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-14 h-14 border-2 border-violet-600">
                    <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xl">
                      {(currentNewsletter.fromUserId?.name || 'R')[0].toUpperCase()}
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white">
                      {currentNewsletter.fromUserId?.name || currentNewsletter.fromUserId?.email || 'Realtor'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(currentNewsletter.createdAt)}</span>
                    </div>
                  </div>
                  {!currentNewsletter.read && (
                    <Badge className="bg-violet-600/30 text-violet-300 border border-violet-500">
                      New
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-left">
                  {currentNewsletter.subject || 'Newsletter Update'}
                </DialogTitle>
              </DialogHeader>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Full Newsletter Content */}
                <div className="prose prose-invert max-w-none">
                  <div className="text-base leading-relaxed text-slate-300 whitespace-pre-wrap">
                    {currentNewsletter.body || currentNewsletter.content}
                  </div>
                </div>

                {/* Full Size Image */}
                {currentNewsletter.meta?.imageUrl && (
                  <div className="rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 max-h-[400px]">
                    <img
                      src={currentNewsletter.meta.imageUrl}
                      alt="Newsletter image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.parentElement.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Call to Action - Full Details */}
                {currentNewsletter.meta?.cta && (
                  <div className="bg-gradient-to-r from-violet-950/50 to-purple-950/50 p-6 rounded-2xl border-2 border-violet-700">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-violet-600/20 rounded-xl">
                        <MapPin className="w-6 h-6 text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-1">
                          Featured Property
                        </h4>
                        <p className="text-sm text-slate-400">
                          Click below to view full property details and book your viewing
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => window.open(currentNewsletter.meta.cta.url, '_blank')}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold text-lg py-6 shadow-xl shadow-violet-900/30"
                      size="lg"
                    >
                      <span className="flex items-center gap-2">
                        {currentNewsletter.meta.cta.label}
                        <ExternalLink className="w-5 h-5" />
                      </span>
                    </Button>

                    <p className="text-xs text-slate-500 text-center mt-3">
                      You'll be redirected to the property page where you can book a viewing
                    </p>
                  </div>
                )}

                {/* Additional Info */}
                <div className="pt-4 border-t border-slate-800">
                  <p className="text-sm text-slate-500 text-center">
                    This newsletter was sent by {currentNewsletter.fromUserId?.name || 'your realtor'} on{' '}
                    {formatDate(currentNewsletter.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsInboxPage;