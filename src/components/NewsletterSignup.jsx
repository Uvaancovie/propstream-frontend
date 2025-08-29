import React, { useState } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { newsletterAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const NewsletterSignup = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await newsletterAPI.subscribe(email);
      const successMessage = response.message || 'Successfully subscribed to newsletter!';
      setMessage(successMessage);
      setIsSuccess(true);
      setEmail('');
      toast.success(successMessage);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to subscribe. Please try again.';
      setMessage(errorMessage);
      setIsSuccess(false);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="text-center mb-4">
        <EnvelopeIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Stay Updated</h3>
        <p className="text-sm text-gray-600">
          Get the latest property listings and updates delivered to your inbox
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Subscribing...</span>
            </>
          ) : (
            'Subscribe to Newsletter'
          )}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          isSuccess 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default NewsletterSignup;
