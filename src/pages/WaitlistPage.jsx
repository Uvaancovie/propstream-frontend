import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Rocket, 
  Calendar,
  MessageCircle,
  BarChart3,
  Shield,
  Zap,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  X,
  Timer,
  CreditCard,
  Sparkles,
  Monitor,
  Smartphone,
  Globe,
  Bell,
  Heart,
  TrendingUp,
  Lock,
  Clock,
  Mail,
  Wifi,
  CloudLightning
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const WaitlistPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Try to store in Supabase first
      const { data, error } = await supabase
        .from('waitlist')
        .insert([
          {
            email: email,
            source: 'waitlist_page',
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        // Fall back to API if Supabase fails
        throw new Error('Supabase failed, trying API');
      }

      console.log('✅ Successfully stored in Supabase:', data);
      setIsSubmitted(true);
      setEmail('');

    } catch (supabaseError) {
      console.log('Falling back to API...');
      
      // Fallback to original API
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/waitlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, source: "waitlist_page" }),
        });

        const data = await response.json();
        
        if (response.ok) {
          setIsSubmitted(true);
          setEmail('');
        } else {
          alert(data.message || "Could not join the waitlist. Try again.");
        }
      } catch (error) {
        console.error('Both Supabase and API failed:', error);
        alert("Network error. Please try again or contact us directly.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Header Component
  const Header = () => (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-[#0A0A0A]/60 bg-[#0A0A0A]/80 border-b border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/novaprop-logo.jpeg" 
              alt="NovaProp" 
              className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg shadow-[0_0_20px_rgba(124,58,237,.45)]" 
            />
            <span className="text-lg sm:text-xl font-bold text-white">PropNova</span>
          </Link>
          
          <Link 
            to="/" 
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </header>
  );

  // Hero Section
  const HeroSection = () => (
    <section className="relative overflow-hidden py-12 sm:py-16 md:py-24 lg:py-32">
      {/* Cosmic gradient aura */}
      <div className="pointer-events-none absolute -inset-x-40 -top-40 -z-10 blur-3xl">
        <div className="mx-auto aspect-[1155/678] w-[36rem] md:w-[80rem]
          bg-gradient-to-tr from-violet-900/30 via-violet-600/20 to-transparent opacity-60"
          style={{ clipPath: "polygon(74% 44%, 100% 61%, 92% 100%, 60% 88%, 30% 100%, 0 76%, 0 29%, 18% 0, 53% 7%, 79% 26%)" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <Badge className="bg-violet-700/70 text-white border border-violet-500/40 mb-6 text-lg px-4 py-2">
            🚀 Launching September 11, 2025
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            <span className="text-white block">Join the</span>{" "}
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent block">
              PropNova Revolution
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Be among the first to experience the future of property management. 
            <span className="text-violet-400 font-semibold"> Save 50% on your first year</span> as an early adopter.
          </p>

          {/* Countdown Timer */}
          <div className="bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/30 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            <div className="text-violet-400 text-sm font-medium mb-2">LAUNCH COUNTDOWN</div>
            <div className="text-4xl font-bold text-white mb-2">7 DAYS</div>
            <div className="text-slate-300">September 11, 2025 • 09:00 SAST</div>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for exclusive early access" 
                  className="flex-1 bg-[#0F0F13] border-slate-700 text-white placeholder:text-slate-500 text-lg h-12" 
                  disabled={isSubmitting}
                />
                <Button 
                  type="submit" 
                  className="bg-violet-600 hover:bg-violet-700 whitespace-nowrap h-12 px-8 text-lg font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <CloudLightning className="h-5 w-5 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      🚀 Join Waitlist
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-600/20 border border-green-500/40 rounded-xl p-6 max-w-md mx-auto mb-8"
            >
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">🎉 You're In!</h3>
              <p className="text-slate-300">
                Welcome to the PropNova revolution! Check your email for exclusive launch details.
              </p>
            </motion.div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-slate-300 justify-center">
            <span className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4 text-violet-400" /> Secure & Private
            </span>
            <span className="inline-flex items-center gap-2">
              <Timer className="h-4 w-4 text-violet-400" /> 5-minute setup
            </span>
            <span className="inline-flex items-center gap-2">
              <Heart className="h-4 w-4 text-violet-400" /> Made in South Africa
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );

  // Software Demo Section
  const SoftwareDemoSection = () => {
    const features = [
      {
        icon: Calendar,
        title: "Smart Calendar Sync",
        description: "Automatically sync calendars across Airbnb, Booking.com, and VRBO",
        demo: "No more double bookings. Our AI syncs everything in real-time.",
        color: "from-blue-600 to-cyan-600",
        bgColor: "bg-blue-600/10",
        borderColor: "border-blue-500/30"
      },
      {
        icon: MessageCircle,
        title: "Automated Messaging",
        description: "Send personalized messages to guests automatically",
        demo: "Check-in instructions, house rules, and follow-ups happen automatically.",
        color: "from-green-600 to-emerald-600",
        bgColor: "bg-green-600/10", 
        borderColor: "border-green-500/30"
      },
      {
        icon: BarChart3,
        title: "Performance Analytics",
        description: "Track bookings, revenue, and occupancy rates",
        demo: "See your growth with beautiful charts and insights.",
        color: "from-violet-600 to-purple-600",
        bgColor: "bg-violet-600/10",
        borderColor: "border-violet-500/30"
      },
      {
        icon: Zap,
        title: "Workflow Automation",
        description: "Connect with Zapier, Make, and other tools",
        demo: "Automate everything from pricing to cleaning schedules.",
        color: "from-orange-600 to-red-600",
        bgColor: "bg-orange-600/10",
        borderColor: "border-orange-500/30"
      }
    ];

    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#0E0E12] to-[#0A0A0A]">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-violet-700/70 text-white border border-violet-700/50 mb-4">
              Software Demonstration
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6">
              See PropNova in Action
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Professional property management tools that work seamlessly together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className={`${feature.bgColor} ${feature.borderColor} border backdrop-blur-sm h-full hover:scale-105 transition-all duration-300`}>
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                      <p className="text-slate-300 text-lg mb-4">{feature.description}</p>
                      
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <div className="text-slate-400 text-sm mb-2">Demo:</div>
                        <div className="text-white">{feature.demo}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  // How It Works Section
  const HowItWorksSection = () => {
    const steps = [
      {
        step: 1,
        icon: Wifi,
        title: "Connect Your Accounts",
        description: "Link Airbnb, Booking.com, VRBO in 2 minutes",
        details: "Secure OAuth integration • Instant sync • No passwords stored"
      },
      {
        step: 2,
        icon: Sparkles,
        title: "Customize Automation",
        description: "Set up smart templates and workflows",
        details: "SA-ready messages • Custom workflows • Smart triggers"
      },
      {
        step: 3,
        icon: TrendingUp,
        title: "Scale & Grow",
        description: "Add properties and watch your business grow",
        details: "Real-time insights • Performance tracking • Growth analytics"
      }
    ];

    return (
      <section className="py-16 md:py-24 bg-[#0A0A0A]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-violet-700/70 text-white border border-violet-700/50 mb-4">
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6">
              Three Steps to Success
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Get started in minutes, not hours
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="text-center relative"
                >
                  {/* Connection line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-20 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-violet-600 to-transparent"></div>
                  )}
                  
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,.3)] mb-4">
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto">
                      {step.step}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-300 text-lg mb-4">{step.description}</p>
                  <p className="text-slate-400 text-sm">{step.details}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  // Benefits Section
  const BenefitsSection = () => {
    const benefits = [
      {
        icon: Clock,
        title: "Save 5+ Hours Weekly",
        description: "Automate repetitive tasks and focus on growing your business"
      },
      {
        icon: Lock,
        title: "Bank-Grade Security",
        description: "Your data is encrypted and protected with enterprise security"
      },
      {
        icon: Globe,
        title: "Multi-Platform Sync",
        description: "Works with all major booking platforms in South Africa"
      },
      {
        icon: Bell,
        title: "Smart Notifications",
        description: "Get alerts for bookings, issues, and opportunities"
      },
      {
        icon: Users,
        title: "Team Collaboration",
        description: "Manage multiple properties with your team seamlessly"
      },
      {
        icon: Star,
        title: "5-Star Support",
        description: "Local South African support team ready to help"
      }
    ];

    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#0E0E12] to-[#0A0A0A]">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6">
              Why Property Pros Choose PropNova
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Built specifically for South African property managers and hosts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-[#0B0B0E] border border-violet-900/40 hover:border-violet-700/60 transition-all duration-300 h-full hover:scale-105">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-violet-900/30 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-violet-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-3">{benefit.title}</h3>
                      <p className="text-slate-300">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  // Final CTA Section
  const FinalCTASection = () => (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#0A0A0A] to-[#0E0E12]">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/40 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
            <Rocket className="h-16 w-16 text-violet-400 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
              Ready to Transform Your Property Business?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join <span className="text-violet-400 font-semibold">2,847+ property professionals</span> waiting for PropNova to launch
            </p>
            
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email" 
                    className="flex-1 bg-[#0F0F13] border-slate-700 text-white placeholder:text-slate-500 h-12" 
                    disabled={isSubmitting}
                  />
                  <Button 
                    type="submit" 
                    className="bg-violet-600 hover:bg-violet-700 whitespace-nowrap h-12 px-8 font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <CloudLightning className="h-5 w-5 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        Join the Revolution
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-600/20 border border-green-500/40 rounded-xl p-6 max-w-md mx-auto"
              >
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">🎉 Welcome to the Revolution!</h3>
                <p className="text-slate-300">
                  You'll be among the first to experience PropNova. See you on September 11th!
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] text-white overflow-x-hidden">
      <Header />
      <HeroSection />
      <SoftwareDemoSection />
      <HowItWorksSection />
      <BenefitsSection />
      <FinalCTASection />
    </div>
  );
};

export default WaitlistPage;
