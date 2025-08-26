import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
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
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'R99',
      period: '/month',
      description: 'Perfect for individual property owners',
      features: [
        'Up to 3 properties',
        'Basic calendar sync',
        'Message templates',
        'Email support',
        'Mobile app access'
      ],
      popular: false,
      priceId: 'starter_monthly'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 'R299',
      period: '/month',
      description: 'Ideal for growing property portfolios',
      features: [
        'Up to 15 properties',
        'Advanced calendar sync',
        'Automated messaging',
        'Priority support',
        'Analytics dashboard',
        'Multi-platform integration',
        'Custom branding'
      ],
      popular: true,
      priceId: 'professional_monthly'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'R699',
      period: '/month',
      description: 'For large property management companies',
      features: [
        'Unlimited properties',
        'White-label solution',
        'Advanced automation',
        'Dedicated support',
        'Custom integrations',
        'Team collaboration',
        'Advanced reporting',
        'API access'
      ],
      popular: false,
      priceId: 'enterprise_monthly'
    }
  ];

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/api/billing/subscription');
      setSubscription(response.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // User might not have a subscription yet
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    setProcessingPayment(true);
    try {
      const response = await api.post('/api/billing/subscribe', { 
        planId,
        returnUrl: window.location.origin + '/billing',
        cancelUrl: window.location.origin + '/billing'
      });
      
      // Redirect to Payfast payment page
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Error processing payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      try {
        await api.post('/api/billing/cancel');
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
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="mt-2 text-gray-600">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Subscription Status */}
      {subscription && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Current Subscription</h2>
            <button
              onClick={fetchSubscription}
              className="btn btn-secondary text-sm flex items-center space-x-1"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{subscription.planName}</h3>
                <p className="text-2xl font-bold text-primary-600">R{subscription.amount}</p>
                <p className="text-sm text-gray-600">per month</p>
              </div>
              
              <div className="flex items-center space-x-2">
                {React.createElement(getStatusIcon(subscription.status), {
                  className: "w-5 h-5"
                })}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <CalendarDaysIcon className="w-4 h-4 mr-2" />
                <span>Started: {formatDate(subscription.startDate)}</span>
              </div>
              {subscription.nextBillingDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                  <span>Next billing: {formatDate(subscription.nextBillingDate)}</span>
                </div>
              )}
              {subscription.endDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                  <span>Ends: {formatDate(subscription.endDate)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
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
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="card">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {subscription ? 'Upgrade Your Plan' : 'Choose Your Plan'}
          </h2>
          <p className="mt-2 text-gray-600">
            Select the perfect plan for your property management needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative rounded-lg border-2 p-6 ${
                plan.popular 
                  ? 'border-primary-500 shadow-lg' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={processingPayment || (subscription && subscription.planId === plan.priceId && subscription.status === 'active')}
                className={`w-full btn ${
                  plan.popular ? 'btn-primary' : 'btn-secondary'
                } ${
                  subscription && subscription.planId === plan.priceId && subscription.status === 'active'
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {processingPayment ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Processing...</span>
                  </div>
                ) : subscription && subscription.planId === plan.priceId && subscription.status === 'active' ? (
                  'Current Plan'
                ) : subscription ? (
                  'Switch Plan'
                ) : (
                  'Get Started'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

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
