import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  MessageSquare,
  Zap,
  Shield,
  Clock,
  Wallet,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Users,
  BarChart3,
  Smartphone,
  BookmarkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startCheckout } from '../lib/billing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const NovapropLanding = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Nova Prop</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/#features" className="text-gray-600 hover:text-violet-600 transition-colors">Features</a>
            <a href="/#demo" className="text-gray-600 hover:text-violet-600 transition-colors">Demo</a>
            <a href="/#faq" className="text-gray-600 hover:text-violet-600 transition-colors">FAQ</a>
            <Button 
              onClick={() => window.location.href = '/signup'}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Start Free
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-violet-50 px-4 py-20">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 bg-violet-100 text-violet-700 border-violet-200">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Property Management
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Generate Professional Property Listings with 
              <span className="text-violet-600"> AI in Seconds</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create compelling property descriptions, save drafts, and manage your listings all in one place. 
              Join thousands of realtors using AI to boost their sales.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center text-gray-600">
                <Shield className="w-5 h-5 text-violet-600 mr-2" />
                Secure & Reliable
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 text-violet-600 mr-2" />
                5-minute setup
              </div>
              <div className="flex items-center text-gray-600">
                <Wallet className="w-5 h-5 text-violet-600 mr-2" />
                Payfast ready
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg"
                className="bg-violet-600 hover:bg-violet-700"
                onClick={() => window.location.href = '/signup'}
              >
                Start Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="secondary"
                onClick={() => window.location.href = '/demo'}
                className="border-violet-200 text-violet-700 hover:bg-violet-700 hover:text-white"
              >
                Book a Demo
              </Button>
            </div>

            <p className="text-sm text-gray-500 mb-8">
              ✨ Start with 8 free AI generations per month. Upgrade anytime.
            </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}
                className="border-violet-200 text-violet-600 hover:bg-violet-50"
              >
                View Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visual Gallery */}
      <section id="demo" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">See Novaprop in Action</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Get a preview of how Novaprop will transform your property management workflow</p>
          </div>
          
          {/* Demo Dashboard Mockup */}
          <div className="max-w-6xl mx-auto mb-16">
            <Card className="border-violet-100 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-violet-600 to-purple-700 text-white p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Novaprop Dashboard</h3>
                        <p className="text-violet-100">All your properties at a glance</p>
                      </div>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30">
                      Live Demo
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                      <div className="flex items-center space-x-3 mb-3">
                        <Calendar className="w-5 h-5 text-violet-200" />
                        <span className="font-semibold">Calendar Sync</span>
                      </div>
                      <div className="text-2xl font-bold mb-1">3 Properties</div>
                      <div className="text-violet-200 text-sm">Synced across all platforms</div>
                    </div>
                    
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                      <div className="flex items-center space-x-3 mb-3">
                        <MessageSquare className="w-5 h-5 text-violet-200" />
                        <span className="font-semibold">Messages</span>
                      </div>
                      <div className="text-2xl font-bold mb-1">12 Automated</div>
                      <div className="text-violet-200 text-sm">Templates sent this week</div>
                    </div>
                    
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                      <div className="flex items-center space-x-3 mb-3">
                        <Users className="w-5 h-5 text-violet-200" />
                        <span className="font-semibold">Bookings</span>
                      </div>
                      <div className="text-2xl font-bold mb-1">8 Active</div>
                      <div className="text-violet-200 text-sm">No conflicts detected</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Mockups */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <Card className="border-violet-100 h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Unified Calendar View</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded border-l-4 border-green-500">
                      <span className="text-sm text-gray-600">Airbnb Booking</span>
                      <span className="text-xs text-green-600">Confirmed</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                      <span className="text-sm text-gray-600">Booking.com</span>
                      <span className="text-xs text-blue-600">Synced</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded border-l-4 border-purple-500">
                      <span className="text-sm text-gray-600">VRBO Inquiry</span>
                      <span className="text-xs text-purple-600">Pending</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">All platforms synced in real-time</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <Card className="border-violet-100 h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Smart Messaging</h3>
                  <div className="space-y-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Welcome Message</div>
                      <div className="text-sm text-gray-700">"Hi! Welcome to Cape Town..."</div>
                      <div className="text-xs text-green-600 mt-1">✓ Sent automatically</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Check-in Instructions</div>
                      <div className="text-sm text-gray-700">"Your keypad code is..."</div>
                      <div className="text-xs text-blue-600 mt-1">⏰ Scheduled for 3pm</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">Automated templates in multiple languages</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <Card className="border-violet-100 h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                    <Smartphone className="w-6 h-6 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Mobile Ready</h3>
                  <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg p-4 mb-4">
                    <div className="bg-white rounded shadow-sm p-3 mb-2">
                      <div className="h-2 bg-violet-200 rounded mb-2"></div>
                      <div className="h-1 bg-gray-200 rounded mb-1"></div>
                      <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="bg-white rounded shadow-sm p-3">
                      <div className="h-2 bg-green-200 rounded mb-2"></div>
                      <div className="h-1 bg-gray-200 rounded mb-1"></div>
                      <div className="h-1 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">Manage everything on the go</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-violet-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features for Modern Realtors</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">AI-powered tools to create listings faster, manage your portfolio, and grow your business.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-violet-100 hover:shadow-lg transition-shadow duration-300 h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-violet-600" />
                  </div>
                  <CardTitle className="text-xl">AI Listing Generator</CardTitle>
                  <CardDescription>
                    Generate professional property descriptions, amenities lists, and SEO keywords in seconds using advanced AI.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      Instant content generation
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      Customizable templates
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      SEO-optimized keywords
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-violet-100 hover:shadow-lg transition-shadow duration-300 h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                    <BookmarkIcon className="w-6 h-6 text-violet-600" />
                  </div>
                  <CardTitle className="text-xl">Saved Listings</CardTitle>
                  <CardDescription>
                    Save up to 10 AI-generated listings as drafts. Edit, manage, and publish when ready.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      Unlimited saves (10 limit)
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      Full editing capabilities
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      Generation history
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-violet-100 hover:shadow-lg transition-shadow duration-300 h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                    <Wallet className="w-6 h-6 text-violet-600" />
                  </div>
                  <CardTitle className="text-xl">Flexible Billing</CardTitle>
                  <CardDescription>
                    Start free with 8 AI generations. Upgrade to Growth plan for 15 generations per month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      Payfast integration
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      Monthly subscriptions
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      Cancel anytime
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Calculate your time savings</h2>
              <p className="text-xl text-gray-600">See how much Novaprop could save you each month</p>
            </div>

            <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-white">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Without Novaprop</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Calendar management</span>
                        <span className="font-semibold">2.5 hrs/week</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Guest messaging</span>
                        <span className="font-semibold">3 hrs/week</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Manual updates</span>
                        <span className="font-semibold">1.5 hrs/week</span>
                      </div>
                      <hr className="border-violet-200" />
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total weekly time</span>
                        <span className="text-red-600">7 hours</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">With Novaprop</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Calendar management</span>
                        <span className="font-semibold">0.5 hrs/week</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Guest messaging</span>
                        <span className="font-semibold">1 hr/week</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Manual updates</span>
                        <span className="font-semibold">0.5 hrs/week</span>
                      </div>
                      <hr className="border-violet-200" />
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total weekly time</span>
                        <span className="text-green-600">2 hours</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-violet-600 rounded-xl text-white text-center">
                  <div className="text-3xl font-bold mb-2">Save 5 hours per week</div>
                  <div className="text-violet-100">That's 20 hours per month to focus on what matters</div>
                  <div className="text-sm text-violet-200 mt-2">Worth R2,000+ in time value for most hosts</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-violet-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Start Creating Amazing Property Listings Today</h2>
            <p className="text-xl text-gray-600 mb-8">Join realtors who are saving hours with AI-powered listing generation</p>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-violet-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
                  <p className="text-gray-600 text-sm">Generate professional listings in seconds</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookmarkIcon className="w-8 h-8 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Save & Edit</h3>
                  <p className="text-gray-600 text-sm">Manage up to 10 draft listings</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Flexible Pricing</h3>
                  <p className="text-gray-600 text-sm">Free tier + affordable upgrades</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-violet-600 hover:bg-violet-700"
                  onClick={() => window.location.href = '/register'}
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => startCheckout('growth')}
                  className="border-violet-200 text-violet-600 hover:bg-violet-50"
                >
                  View Pricing
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                ✨ Start with 8 free AI generations • Upgrade anytime • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300">Everything you need to know about Novaprop</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="overflow-hidden rounded-lg border border-gray-700">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800 border-b border-gray-700">
                    <th className="text-left py-4 px-6 text-violet-400 font-semibold text-lg">Question</th>
                    <th className="text-left py-4 px-6 text-violet-400 font-semibold text-lg">Answer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-6 px-6 text-white font-medium align-top w-1/3">
                      How does the calendar sync work?
                    </td>
                    <td className="py-6 px-6 text-gray-300">
                      Novaprop connects directly with Airbnb, Booking.com, VRBO, and other platforms using their official APIs. 
                      When a booking comes in on any platform, it automatically blocks those dates across all your other listings. 
                      No more manual updates or double bookings.
                    </td>
                  </tr>
                  
                  <tr className="border-b border-gray-700">
                    <td className="py-6 px-6 text-white font-medium align-top w-1/3">
                      Is Payfast integration included?
                    </td>
                    <td className="py-6 px-6 text-gray-300">
                      Yes! We have full Payfast integration ready to go, plus Stripe for international guests. 
                      Set up secure payments in under 5 minutes with our South African-optimized checkout flow.
                    </td>
                  </tr>
                  
                  <tr className="border-b border-gray-700">
                    <td className="py-6 px-6 text-white font-medium align-top w-1/3">
                      Can I really set this up in 5 minutes?
                    </td>
                    <td className="py-6 px-6 text-gray-300">
                      Absolutely. Connect your first property, sync one calendar, and set up basic messaging templates in under 5 minutes. 
                      Advanced features and automations can be added as you grow.
                    </td>
                  </tr>
                  
                  <tr className="border-b border-gray-700">
                    <td className="py-6 px-6 text-white font-medium align-top w-1/3">
                      When will Novaprop be available?
                    </td>
                    <td className="py-6 px-6 text-gray-300">
                      Novaprop is live now! Sign up for free and start generating AI-powered property listings immediately. 
                      Get 8 free generations per month with the option to upgrade anytime.
                    </td>
                  </tr>
                  
                  <tr className="border-b border-gray-700">
                    <td className="py-6 px-6 text-white font-medium align-top w-1/3">
                      What platforms do you support?
                    </td>
                    <td className="py-6 px-6 text-gray-300">
                      We support all major booking platforms including Airbnb, Booking.com, VRBO, Agoda, and more. 
                      Our system automatically syncs calendars, manages bookings, and sends automated messages across all platforms.
                    </td>
                  </tr>
                  
                  <tr>
                    <td className="py-6 px-6 text-white font-medium align-top w-1/3">
                      Is my data secure?
                    </td>
                    <td className="py-6 px-6 text-gray-300">
                      Absolutely. We use bank-level encryption and security protocols. Your property and guest data is stored securely 
                      in South African data centers, and we're fully POPIA compliant. We never share your data with third parties.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Novaprop</span>
              </div>
              <p className="text-gray-400">
                Unified property operations for South African hosts and agencies.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/demo" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="/integrations" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/guides" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="/api" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="/status" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <hr className="border-gray-800 my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2025 Novaprop. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NovapropLanding;
