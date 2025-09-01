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
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const PropnovaLanding = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = `${import.meta.env.VITE_API_URL || "https://propstream-api.onrender.com"}/api/newsletter/subscribe`;
      const response = await fetch(url, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email, source: "landing" })
      });
      
      if (response.ok) {
        alert("🎉 You're on the list! Check your inbox for confirmation. We'll notify you when Propnova launches!");
        setEmail('');
      } else {
        alert("Could not join the waitlist. Please try again.");
      }
    } catch (error) {
      alert("Could not join the waitlist. Please try again.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Propnova</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-violet-600 transition-colors">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-violet-600 transition-colors">Pricing</a>
            <a href="#faq" className="text-gray-600 hover:text-violet-600 transition-colors">FAQ</a>
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/login'}
              className="text-gray-600 hover:text-violet-600"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => window.location.href = '/register'}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Start Free Trial
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
              Coming Soon
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Save hours each week with a 
              <span className="text-violet-600"> unified property ops hub</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Propnova unifies listings, calendar, and messaging—so Durban hosts & small agencies work smarter, not harder.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center text-gray-600">
                <Shield className="w-5 h-5 text-violet-600 mr-2" />
                Secure
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

            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-6">
              <Input
                type="email"
                required
                placeholder="Enter your email for early access"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                disabled={isSubmitting}
              />
              <Button 
                type="submit" 
                className="bg-violet-600 hover:bg-violet-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
              </Button>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/register'}
                className="bg-violet-600 hover:bg-violet-700"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => window.location.href = '/demo'}
                className="border-violet-200 text-violet-600 hover:bg-violet-50"
              >
                Book a Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visual Gallery */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for South African Property Pros</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Professional tools that actually work for local hosts and agencies</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Modern property management dashboard"
                className="w-full h-64 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-violet-900/20"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-semibold text-lg">Unified Dashboard</h3>
                <p className="text-white/90 text-sm">All your properties in one view</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Beautiful Cape Town property listing"
                className="w-full h-64 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-violet-900/20"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-semibold text-lg">Smart Calendar</h3>
                <p className="text-white/90 text-sm">No more double bookings</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Guest messaging and communication"
                className="w-full h-64 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-violet-900/20"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-semibold text-lg">Auto Messaging</h3>
                <p className="text-white/90 text-sm">Templates that convert</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-violet-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need in one place</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Stop juggling multiple apps. Propnova brings together calendar sync, messaging, and automations.</p>
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
                    <Calendar className="w-6 h-6 text-violet-600" />
                  </div>
                  <CardTitle className="text-xl">Unified Calendar</CardTitle>
                  <CardDescription>
                    Sync Airbnb, Booking.com, and VRBO calendars automatically. No more double bookings, ever.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      Two-way calendar sync
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      Block dates instantly
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      Multiple platform support
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
                    <MessageSquare className="w-6 h-6 text-violet-600" />
                  </div>
                  <CardTitle className="text-xl">Smart Messaging</CardTitle>
                  <CardDescription>
                    Pre-written templates for check-in instructions, house rules, and follow-ups that actually get results.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      South African templates
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      Auto-scheduled messages
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      Multi-language support
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
                    <Zap className="w-6 h-6 text-violet-600" />
                  </div>
                  <CardTitle className="text-xl">Automations</CardTitle>
                  <CardDescription>
                    Connect with Make, Zapier, or our built-in workflows. Automate the boring stuff, focus on hosting.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      Make/Zapier integration
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      Custom workflows
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-violet-600 mr-2" />
                      Smart notifications
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
              <p className="text-xl text-gray-600">See how much Propnova could save you each month</p>
            </div>

            <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-white">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Without Propnova</h3>
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">With Propnova</h3>
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

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-violet-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-600">Start free, scale as you grow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-violet-100 relative h-full">
                <CardHeader>
                  <CardTitle className="text-xl">Starter</CardTitle>
                  <CardDescription>Perfect for individual hosts</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">Free</span>
                    <span className="text-gray-600"> for 14 days</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-violet-600 mr-3" />
                      Up to 2 properties
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-violet-600 mr-3" />
                      Basic calendar sync
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-violet-600 mr-3" />
                      Message templates
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-violet-600 mr-3" />
                      Email support
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-violet-600 hover:bg-violet-700"
                    onClick={() => window.location.href = '/register'}
                  >
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-violet-200 relative h-full shadow-lg">
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-violet-600">
                  Most Popular
                </Badge>
                <CardHeader>
                  <CardTitle className="text-xl">Growth</CardTitle>
                  <CardDescription>For growing property portfolios</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">R199</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-violet-600 mr-3" />
                      Up to 10 properties
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-violet-600 mr-3" />
                      Advanced automations
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-violet-600 mr-3" />
                      Analytics & reports
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-violet-600 mr-3" />
                      Priority support
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-violet-600 mr-3" />
                      Make/Zapier integration
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-violet-600 hover:bg-violet-700"
                    onClick={() => window.location.href = '/billing'}
                  >
                    Start Growth Plan
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-violet-100 relative h-full">
                <CardHeader>
                  <CardTitle className="text-xl">Agency</CardTitle>
                  <CardDescription>For property management companies</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">Custom</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-violet-600 mr-3" />
                      Unlimited properties
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-violet-600 mr-3" />
                      White-label options
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-violet-600 mr-3" />
                      Custom integrations
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-violet-600 mr-3" />
                      Dedicated support
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-violet-600 mr-3" />
                      SLA guarantee
                    </li>
                  </ul>
                  <Button 
                    variant="outline"
                    className="w-full border-violet-200 text-violet-600 hover:bg-violet-50"
                    onClick={() => window.location.href = '/contact'}
                  >
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about Propnova</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="border-violet-100">
              <CardHeader>
                <CardTitle className="text-lg">How does the calendar sync work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Propnova connects directly with Airbnb, Booking.com, VRBO, and other platforms using their official APIs. 
                  When a booking comes in on any platform, it automatically blocks those dates across all your other listings. 
                  No more manual updates or double bookings.
                </p>
              </CardContent>
            </Card>

            <Card className="border-violet-100">
              <CardHeader>
                <CardTitle className="text-lg">Is Payfast integration included?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! We have full Payfast integration ready to go, plus Stripe for international guests. 
                  Set up secure payments in under 5 minutes with our South African-optimized checkout flow.
                </p>
              </CardContent>
            </Card>

            <Card className="border-violet-100">
              <CardHeader>
                <CardTitle className="text-lg">Can I really set this up in 5 minutes?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Absolutely. Connect your first property, sync one calendar, and set up basic messaging templates in under 5 minutes. 
                  Advanced features and automations can be added as you grow.
                </p>
              </CardContent>
            </Card>

            <Card className="border-violet-100">
              <CardHeader>
                <CardTitle className="text-lg">What happens after the 14-day trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You can continue with our Growth plan (R199/month) or downgrade to our limited free tier. 
                  No credit card required for the trial, and you can cancel anytime with no questions asked.
                </p>
              </CardContent>
            </Card>
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
                <span className="text-xl font-bold">Propnova</span>
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
              © 2025 Propnova. All rights reserved.
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

export default PropnovaLanding;
