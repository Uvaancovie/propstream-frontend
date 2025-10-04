import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { Separator } from '../components/ui/separator';
import { 
  Send, 
  Users, 
  Calendar, 
  ExternalLink, 
  Image as ImageIcon,
  Newspaper,
  AlertCircle,
  CheckCircle,
  Eye,
  Mail
} from 'lucide-react';

const RealtorNewsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('compose');
  
  // Compose form state
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    imageUrl: '',
    cta: { label: '', url: '' }
  });
  const [sending, setSending] = useState(false);
  const [quota, setQuota] = useState({ used: 0, limit: 10, remaining: 10 });

  // Subscribers state
  const [subscribers, setSubscribers] = useState([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [subscribersPagination, setSubscribersPagination] = useState({ total: 0, page: 1 });

  // Sent newsletters state
  const [sentNewsletters, setSentNewsletters] = useState([]);
  const [sentLoading, setSentLoading] = useState(false);
  const [sentPagination, setSentPagination] = useState({ total: 0, page: 1 });

  useEffect(() => {
    if (user?.role === 'realtor') {
      fetchQuota();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'subscribers') {
      fetchSubscribers();
    } else if (activeTab === 'sent') {
      fetchSentNewsletters();
    }
  }, [activeTab, subscribersPagination.page, sentPagination.page]);

  const fetchQuota = async () => {
    try {
      const response = await api.get('/newsletter/quota');
      setQuota(response.data);
    } catch (error) {
      console.error('Failed to fetch quota:', error);
    }
  };

  const fetchSubscribers = async () => {
    try {
      setSubscribersLoading(true);
      const response = await api.get(`/newsletter/subscribers?page=${subscribersPagination.page}&pageSize=20`);
      setSubscribers(response.data.rows || []);
      setSubscribersPagination(prev => ({
        ...prev,
        total: response.data.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setSubscribersLoading(false);
    }
  };

  const fetchSentNewsletters = async () => {
    try {
      setSentLoading(true);
      const response = await api.get(`/newsletter/sent?page=${sentPagination.page}&pageSize=20`);
      setSentNewsletters(response.data.newsletters || []);
      setSentPagination(prev => ({
        ...prev,
        total: response.data.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch sent newsletters:', error);
    } finally {
      setSentLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) errors.push('Title is required');
    if (formData.title.length > 120) errors.push('Title must be 120 characters or less');
    
    if (!formData.body.trim()) errors.push('Body is required');
    if (formData.body.length > 8000) errors.push('Body must be 8000 characters or less');
    
    if (formData.imageUrl && !formData.imageUrl.startsWith('https://')) {
      errors.push('Image URL must be a valid HTTPS URL');
    }
    
    if (formData.cta.label || formData.cta.url) {
      if (!formData.cta.label.trim()) errors.push('CTA label is required when URL is provided');
      if (!formData.cta.url.trim()) errors.push('CTA URL is required when label is provided');
      if (formData.cta.url && !formData.cta.url.startsWith('https://')) {
        errors.push('CTA URL must be a valid HTTPS URL');
      }
    }
    
    return errors;
  };

  const handleSend = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert('Please fix the following errors:\\n' + errors.join('\\n'));
      return;
    }

    if (quota.remaining <= 0) {
      alert('You have reached your monthly newsletter limit (10/10)');
      return;
    }

    setSending(true);
    try {
      const payload = {
        title: formData.title.trim(),
        body: formData.body.trim()
      };

      if (formData.imageUrl.trim()) {
        payload.imageUrl = formData.imageUrl.trim();
      }

      if (formData.cta.label.trim() && formData.cta.url.trim()) {
        payload.cta = {
          label: formData.cta.label.trim(),
          url: formData.cta.url.trim()
        };
      }

      const response = await api.post('/newsletter/send', payload);
      
      alert(`Newsletter sent successfully to ${response.data.recipients} subscribers!`);
      
      // Reset form
      setFormData({
        title: '',
        body: '',
        imageUrl: '',
        cta: { label: '', url: '' }
      });
      
      // Refresh quota
      fetchQuota();
      
      // Switch to sent tab to see the new newsletter
      setActiveTab('sent');
      
    } catch (error) {
      console.error('Failed to send newsletter:', error);
      
      if (error.response?.data?.code === 'NEWSLETTER_MONTHLY_QUOTA_REACHED') {
        alert('Monthly newsletter limit reached (10/10). Try again next month.');
      } else {
        alert(error.response?.data?.message || 'Failed to send newsletter. Please try again.');
      }
    } finally {
      setSending(false);
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

  if (user?.role !== 'realtor') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <Newspaper className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Only realtors can access newsletter management.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Newspaper className="w-8 h-8 text-violet-600" />
          Newsletter Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Create and send newsletters to your subscribers
        </p>
      </div>

      {/* Quota Display */}
      <Card className="mb-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-violet-600" />
            <div>
              <p className="font-semibold">Monthly Newsletter Quota</p>
              <p className="text-sm text-muted-foreground">
                You've sent {quota.used} out of {quota.limit} newsletters this month
              </p>
            </div>
          </div>
          <Badge 
            variant={quota.remaining > 2 ? "secondary" : quota.remaining > 0 ? "warning" : "destructive"}
            className="text-lg px-3 py-1"
          >
            {quota.remaining} remaining
          </Badge>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">
            <Send className="w-4 h-4 mr-2" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="subscribers">
            <Users className="w-4 h-4 mr-2" />
            Subscribers ({subscribersPagination.total})
          </TabsTrigger>
          <TabsTrigger value="sent">
            <Eye className="w-4 h-4 mr-2" />
            Sent ({sentPagination.total})
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compose Form */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Create Newsletter</h3>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Newsletter title (max 120 characters)"
                    maxLength={120}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.title.length}/120 characters
                  </p>
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.body}
                    onChange={(e) => handleInputChange('body', e.target.value)}
                    placeholder="Write your newsletter content..."
                    rows={8}
                    maxLength={8000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.body.length}/8000 characters
                  </p>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Image URL (optional)
                  </label>
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be a valid HTTPS URL
                  </p>
                </div>

                {/* Call to Action */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Call to Action (optional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={formData.cta.label}
                      onChange={(e) => handleInputChange('cta.label', e.target.value)}
                      placeholder="Button text"
                    />
                    <Input
                      value={formData.cta.url}
                      onChange={(e) => handleInputChange('cta.url', e.target.value)}
                      placeholder="https://example.com"
                      type="url"
                    />
                  </div>
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSend}
                  disabled={sending || quota.remaining <= 0}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Newsletter ({subscribers.length} subscribers)
                    </>
                  )}
                </Button>

                {quota.remaining <= 0 && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 rounded-md">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Monthly limit reached. Try again next month.</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Live Preview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              
              <div className="border border-border rounded-lg p-4 space-y-4">
                {/* Preview Title */}
                <div>
                  <h2 className="text-xl font-bold">
                    {formData.title || 'Newsletter Title'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    From: {user.name || user.email}
                  </p>
                </div>

                <Separator />

                {/* Preview Body */}
                <div className="whitespace-pre-wrap">
                  {formData.body || 'Your newsletter content will appear here...'}
                </div>

                {/* Preview Image */}
                {formData.imageUrl && (
                  <div className="rounded-md overflow-hidden border border-border">
                    <img
                      src={formData.imageUrl}
                      alt="Newsletter preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%23f3f4f6"/><text x="200" y="100" text-anchor="middle" fill="%23374151" font-family="sans-serif">Image not found</text></svg>';
                      }}
                    />
                  </div>
                )}

                {/* Preview CTA */}
                {formData.cta.label && formData.cta.url && (
                  <div>
                    <Button className="bg-violet-600 hover:bg-violet-700">
                      {formData.cta.label}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Subscribers</h3>
            
            {subscribersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No subscribers yet</h3>
                <p className="text-muted-foreground">
                  Clients will appear here when they subscribe to your newsletter from your property listings
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {subscribers.map(subscriber => (
                  <div key={subscriber._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                          {(subscriber.clientId?.name || subscriber.clientId?.email || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {subscriber.clientId?.name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {subscriber.clientId?.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant="secondary">Subscribed</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Since {formatDate(subscriber.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Sent Tab */}
        <TabsContent value="sent">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sent Newsletters</h3>
            
            {sentLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-2 p-4 border border-border rounded-lg">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                ))}
              </div>
            ) : sentNewsletters.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No newsletters sent</h3>
                <p className="text-muted-foreground">
                  Your sent newsletters will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentNewsletters.map(newsletter => (
                  <div key={newsletter._id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">{newsletter.title}</h4>
                        <p className="text-muted-foreground line-clamp-2">
                          {newsletter.body.substring(0, 150)}
                          {newsletter.body.length > 150 ? '...' : ''}
                        </p>
                      </div>
                      
                      <div className="ml-4 text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">Sent</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(newsletter.sentAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>📧 {newsletter.stats.recipients} recipients</span>
                      <span>✅ {newsletter.stats.delivered} delivered</span>
                      {newsletter.imageUrl && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Image
                        </span>
                      )}
                      {newsletter.cta && (
                        <span className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          CTA
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealtorNewsPage;