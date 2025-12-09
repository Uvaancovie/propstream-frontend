import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const BillingPage = () => {
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Server-truth plans (keep in sync with backend/src/domain/plans.js)
  const plans = [
    {
      id: 'free',
      name: 'Free',
      priceZar: 0,
      period: 'forever',
      description: 'Get started with basic features',
      features: [
        'Up to 2 properties',
        '8 AI listing generations/month',
        '10 saved listings',
        'Basic calendar sync',
        'Email support'
      ],
      popular: false,
    },
    {
      id: 'growth',
      name: 'Growth',
      priceZar: 199,
      period: '/month',
      description: 'Perfect for growing property portfolios',
      features: [
        'Up to 10 properties',
        '15 AI listing generations/month',
        '10 saved listings',
        'Advanced calendar sync',
        'Booking management',
        'Newsletter automation',
        'Messaging system',
        'Priority support'
      ],
      popular: true,
    },
    {
      id: 'agency',
      name: 'Enterprise',
      priceZar: 399,
      period: '/month',
      description: 'For large agencies and enterprise-scale teams',
      features: [
        'Unlimited properties',
        'Unlimited AI generations',
        'Unlimited saved listings',
        'White-label options',
        'Team management',
        'Custom integrations',
        'Dedicated support'
      ],
      popular: false,
    }
  ];

  const formatZAR = (v) => {
    const n = Number(v) || 0;
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);
  };

  useEffect(() => {
    fetchSubscription();
    
    // Check for upgrade intent
    const intent = searchParams.get('intent');
    const reason = searchParams.get('reason');
    if (intent === 'upgrade') {
      if (reason === 'property_limit') {
        toast.error('You\'ve reached your property limit. Please upgrade to continue adding properties.', {
          duration: 6000
        });
      } else if (reason === 'limit') {
        toast.error('You\'ve reached your plan limit. Please upgrade to continue.', {
          duration: 5000
        });
      }
      // Scroll to plans section
      setTimeout(() => {
        document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, []);

  const fetchSubscription = async () => {
    try {
      const [subscriptionResponse, usageResponse] = await Promise.all([
        api.get('/billing/subscription'),
        api.get('/me/summary')
      ]);
      
      // Process subscription data
      const sub = subscriptionResponse.data && subscriptionResponse.data.subscription ? subscriptionResponse.data.subscription : null;
      const org = subscriptionResponse.data && subscriptionResponse.data.organization ? subscriptionResponse.data.organization : null;

      if (!sub && !org) {
        setSubscription(null);
      } else {
        const planId = (org && org.planId) || (sub && sub.planId) || null;
        const planObj = plans.find(p => p.id === planId) || null;
        const view = {
          planId,
          planName: planObj ? planObj.name : (planId || ''),
          amount: planObj ? planObj.priceZar : (sub && sub.amount) || 0,
          status: (org && org.subscriptionStatus) || (sub && sub.status) || 'inactive',
          startDate: sub && sub.createdAt ? sub.createdAt : (org && org.createdAt) || null,
          nextBillingDate: null,
          endDate: null
        };
        setSubscription(view);
      }

      // Process usage data
      if (usageResponse.data && usageResponse.data.usage) {
        setUsage(usageResponse.data.usage);
      }
    } catch (error) {
      // If backend responds 400 when there's no org/user info, treat as no subscription
      if (error.response?.status === 400) {
        setSubscription(null);
        setUsage({ properties: { used: 0, max: 2 }, aiGenerations: { used: 0, max: 8 }, savedListings: { used: 0, max: 10 } });
      } else {
        console.error('Error fetching subscription:', error);
        setSubscription(null);
        setUsage({ properties: { used: 0, max: 2 }, aiGenerations: { used: 0, max: 8 }, savedListings: { used: 0, max: 10 } });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {

    setProcessingPayment(true);
    try {
      const response = await api.post('/billing/subscribe', {
        planId,
        returnUrl: window.location.origin + '/billing',
        cancelUrl: window.location.origin + '/billing'
      });

      // Redirect to PayFast payment page (backend returns { redirect })
      if (response.data && response.data.redirect) {
        window.location.href = response.data.redirect;
        return;
      }

      // Fallback: try checkout hosted flow
      const hosted = await api.post(`/billing/checkout/${planId}`);
      const html = hosted.data;
      if (html && typeof html === 'string') {
        const w = window.open('', '_self');
        w.document.write(html);
        w.document.close();
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      if (error.response?.status === 400) {
        alert('Unable to create subscription: please ensure you are signed in and your organization is set up.');
      } else if (error.response?.status === 500 && error.response?.data?.missing) {
        alert('Billing is not configured on the server. Missing: ' + (error.response.data.missing || []).join(', '));
      } else {
        alert('Error processing payment. Please try again.');
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleTopup = async (credits) => {
    try {
      setProcessingPayment(true);
      const response = await api.post('/billing/ai-topup', { credits });
      
      if (response.data.redirect && response.data.payload) {
        // Create a form and submit to PayFast
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = response.data.redirect;
        
        Object.keys(response.data.payload).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = response.data.payload[key];
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
      }
    } catch (error) {
      console.error('Error initiating top-up:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate top-up');
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      try {
  await api.post('/billing/cancel');
        fetchSubscription();
        alert('Subscription cancelled successfully.');
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        alert('Error cancelling subscription. Please contact support.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return CheckCircleIcon;
      case 'pending':
        return ClockIcon;
      case 'cancelled':
        return XCircleIcon;
      case 'expired':
        return ExclamationTriangleIcon;
      default:
        return ClockIcon;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
        <p className="mt-2 text-white">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Subscription Status */}
      {subscription && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Current Plan: {subscription?.planName}</h2>
              <p className="text-gray-600 mt-1">Manage your subscription and view usage</p>
            </div>
            <button
              onClick={fetchSubscription}
              className="btn btn-secondary text-sm flex items-center space-x-1"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plan Overview */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Plan Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <div className="flex items-center space-x-2">
                    {React.createElement(getStatusIcon(subscription.status), {
                      className: "w-4 h-4"
                    })}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold text-gray-900">
                    {subscription && subscription.amount ? formatZAR(subscription.amount) : 'Free'}/month
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Started</span>
                  <span className="text-sm text-gray-900">{formatDate(subscription.startDate)}</span>
                </div>
              </div>
            </div>

            {/* Usage & Limits */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-3">Usage & Limits</h3>
              {(() => {
                const currentPlan = plans.find(p => p.id === subscription.planId);
                if (!currentPlan) return <p className="text-gray-500 text-sm">Plan details unavailable</p>;

                return (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-black">Properties</span>
                        <span className="font-medium text-black">{usage?.properties?.used || 0} / {usage?.properties?.max || currentPlan.features.find(f => f.includes('properties'))?.replace('Up to ', '').replace(' properties', '') || '∞'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{width: `${Math.min(((usage?.properties?.used || 0) / (usage?.properties?.max || 1)) * 100, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-black">AI Generations</span>
                        <span className="font-medium text-black">{usage?.aiGenerations?.used || 0} / {usage?.aiGenerations?.max || currentPlan.features.find(f => f.includes('AI'))?.replace(' AI listing generations/month', '') || '∞'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{width: `${Math.min(((usage?.aiGenerations?.used || 0) / (usage?.aiGenerations?.max || 1)) * 100, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-black">Saved Listings</span>
                        <span className="font-medium text-black">{usage?.savedListings?.used || 0} / {usage?.savedListings?.max || currentPlan.features.find(f => f.includes('saved listings'))?.replace(' saved listings', '') || '∞'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                          style={{width: `${Math.min(((usage?.savedListings?.used || 0) / (usage?.savedListings?.max || 1)) * 100, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions</h3>
              <div className="space-y-3">
                {subscription.status === 'active' && (
                  <button
                    onClick={handleCancelSubscription}
                    className="w-full btn btn-danger text-sm"
                  >
                    Cancel Subscription
                  </button>
                )}
                {subscription.status === 'cancelled' && subscription.endDate && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      Your subscription will end on {formatDate(subscription.endDate)}.
                      You can reactivate by choosing a plan below.
                    </p>
                  </div>
                )}
                <button
                  onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full btn btn-primary text-sm"
                >
                  {subscription.planId === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div id="plans-section" className="card">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {subscription ? 'Ready to Upgrade?' : 'Choose Your Plan'}
          </h2>
          <p className="text-gray-600 text-lg">
            {subscription ? 'Unlock more features and grow your property business' : 'Select the perfect plan for your property management needs'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 p-6 transition-all duration-200 ${
                plan.popular
                  ? 'border-blue-500 shadow-xl shadow-blue-100 bg-gradient-to-b from-blue-50 to-white'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              } ${
                subscription && subscription.planId === plan.id
                  ? 'ring-2 ring-green-500 border-green-500'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {subscription && subscription.planId === plan.id && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.priceZar === null ? 'Custom' : formatZAR(plan.priceZar)}
                  </span>
                  <span className="text-gray-600 text-lg">/{plan.period.replace('/', '')}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-600">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={processingPayment || (subscription && subscription.planId === plan.id && subscription.status === 'active')}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                } ${
                  subscription && subscription.planId === plan.id && subscription.status === 'active'
                    ? 'opacity-50 cursor-not-allowed bg-green-600 hover:bg-green-600'
                    : ''
                }`}
              >
                {processingPayment ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Processing...</span>
                  </div>
                ) : subscription && subscription.planId === plan.id && subscription.status === 'active' ? (
                  'Current Plan ✓'
                ) : subscription ? (
                  plan.priceZar > (subscription.amount || 0) ? 'Upgrade Now' : 'Change Plan'
                ) : (
                  plan.priceZar === null ? 'Contact Sales' : 'Get Started'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI Credits Top-Up */}
      {subscription && subscription.planId !== 'free' && (
        <div className="card mt-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-black mb-2">Need More AI Credits?</h2>
            <p className="text-gray-600">Purchase one-time credit top-ups for additional AI generations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* 100 Credits */}
            <div className="border-2 border-violet-200 rounded-lg p-6 hover:border-violet-400 transition-colors">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-violet-600 mb-2">
                  {formatZAR(49)}
                </div>
                <div className="text-gray-600">100 AI Credits</div>
              </div>
              <button
                onClick={() => handleTopup(100)}
                className="w-full btn bg-violet-600 hover:bg-violet-700 text-white"
              >
                Purchase 100 Credits
              </button>
            </div>

            {/* 250 Credits */}
            <div className="border-2 border-violet-400 rounded-lg p-6 bg-violet-50 hover:border-violet-500 transition-colors relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  BEST VALUE
                </span>
              </div>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-violet-600 mb-2">
                  {formatZAR(99)}
                </div>
                <div className="text-gray-600">250 AI Credits</div>
                <div className="text-sm text-green-600 font-medium mt-1">Save R24!</div>
              </div>
              <button
                onClick={() => handleTopup(250)}
                className="w-full btn bg-violet-600 hover:bg-violet-700 text-white"
              >
                Purchase 250 Credits
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Credits are added to your account immediately after payment and don't expire.</p>
          </div>
        </div>
      )}

      {/* Payment Information */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Accepted Payment Methods</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <CreditCardIcon className="w-4 h-4 mr-2" />
                <span>Visa, Mastercard, American Express</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                <span>EFT (Electronic Funds Transfer)</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Billing Information</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>• Payments are processed securely by Payfast</p>
              <p>• All prices include applicable taxes</p>
              <p>• You can cancel your subscription at any time</p>
              <p>• Billing cycles start from your subscription date</p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Information */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Billing Support</h3>
            <p className="text-sm text-gray-600 mb-3">
              Have questions about your billing or need to update payment information?
            </p>
            <p className="text-sm text-gray-600">
              Email: <a href="mailto:billing@propstream.co.za" className="text-primary-600 hover:underline">billing@propstream.co.za</a>
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Frequently Asked Questions</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>Can I change plans anytime?</strong> Yes, upgrade or downgrade at any time.</p>
              <p>• <strong>What happens when I cancel?</strong> You keep access until your billing period ends.</p>
              <p>• <strong>Do you offer refunds?</strong> Contact support for refund requests.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
