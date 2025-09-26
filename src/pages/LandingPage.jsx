import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Rocket, 
  CreditCard, 
  Timer, 
  ShieldCheck, 
  Stars as StarsIcon,
  CalendarCheck2,
  Send,
  PlugZap,
  Monitor,
  BarChart3,
  Users,
  MessageCircle,
  Zap,
  CheckCircle,
  ChevronDown,
  Menu,
  X,
  CloudLightning
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

// Hero Component moved outside to prevent re-creation on every render
const Hero = ({ email, isSubmitted, isSubmitting, handleEmailChange, handleSubmit, inputRef }) => {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 md:py-24 lg:py-32">
      {/* Cosmic gradient aura */}
      <div className="pointer-events-none absolute -inset-x-40 -top-40 -z-10 blur-3xl">
        <div className="mx-auto aspect-[1155/678] w-[36rem] md:w-[80rem]
          bg-gradient-to-tr from-violet-900/30 via-violet-600/20 to-transparent opacity-60"
          style={{ clipPath: "polygon(74% 44%, 100% 61%, 92% 100%, 60% 88%, 30% 100%, 0 76%, 0 29%, 18% 0, 53% 7%, 79% 26%)" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <Badge className="bg-violet-700/70 text-white border border-violet-500/40 mb-4">🚀 Launching in 7 Days</Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight">
              <span className="text-white block">Join the PropNova</span>{" "}
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent block">
                Revolution
              </span>
            </h1>

            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl lg:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0">
              Be among the first to experience the future of property management. Get exclusive early access and save 50% on your first year.
            </p>

            <div className="mt-4 sm:mt-6 flex flex-wrap gap-3 sm:gap-4 text-sm text-slate-300 justify-center lg:justify-start">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-violet-400" /> Secure
              </span>
              <span className="inline-flex items-center gap-2">
                <Timer className="h-4 w-4 text-violet-400" /> 5-minute launch
              </span>
              <span className="inline-flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-violet-400" /> Payfast ready
              </span>
            </div>

            {/* Waitlist Form */}
            <div id="waitlist-form" className="mt-6 sm:mt-8 space-y-3">
              {!isSubmitted ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-3">
                    <Link to="/register" className="sm:w-auto">
                      <Button 
                        className="bg-violet-600 hover:bg-violet-700 w-full sm:w-auto whitespace-nowrap h-12 px-8 text-lg font-semibold"
                      >
                        Get Started
                      </Button>
                    </Link>
                    <Link to="/login" className="sm:w-auto">
                      <Button 
                        variant="outline"
                        className="border-violet-600/40 hover:border-violet-600 w-full sm:w-auto text-white whitespace-nowrap h-12 px-8 text-lg font-semibold"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/browse" className="sm:w-auto">
                      <Button
                        className="bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 w-full sm:w-auto whitespace-nowrap h-12 px-6 text-lg font-medium"
                      >
                        Browse Properties
                      </Button>
                    </Link>
                  </div>
                  <p className="text-slate-300 text-center lg:text-left">or join our waitlist:</p>
                  <form key="waitlist-form" onSubmit={handleSubmit} className="max-w-md mx-auto lg:mx-0">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        ref={inputRef}
                        type="email" 
                        required 
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Enter your email for exclusive early access" 
                        className="flex-1 bg-[#0F0F13] border border-slate-700 text-white placeholder:text-slate-500 text-lg h-12 px-4 rounded-md outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" 
                        disabled={isSubmitting}
                        autoComplete="email"
                        autoFocus={false}
                      />
                      <Button 
                        type="submit" 
                        className="bg-violet-600/30 hover:bg-violet-600/40 whitespace-nowrap h-12 px-8 text-lg font-semibold"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <CloudLightning className="h-5 w-5 mr-2 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          <>
                            Join Waitlist
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-green-600/20 border border-green-500/40 rounded-xl p-6 max-w-md mx-auto lg:mx-0">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto lg:mx-0 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2 text-center lg:text-left">🎉 You're In!</h3>
                  <p className="text-slate-300 text-center lg:text-left">
                    Welcome to the PropNova revolution! Check your email for exclusive launch details.
                  </p>
                </div>
              )}
            </div>

            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-400 text-center lg:text-left">
              Built for South African Property Pros — professional tools designed for local hosts and agencies.
            </p>
          </div>

          {/* Right visual - Mansion House */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            {/* Mansion House Illustration */}
            <div className="relative">
              <Card className="rounded-3xl bg-[#0B0B0E] border border-violet-900/40 shadow-[0_0_60px_rgba(124,58,237,.15)] overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] w-full bg-gradient-to-br from-[#0E0E12] to-[#141424] relative">
                    {/* Sky gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-purple-900/10 to-transparent"></div>
                    
                    {/* Stars */}
                    <div className="absolute inset-0">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full opacity-60"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 40}%`,
                            animationDelay: `${Math.random() * 3}s`
                          }}
                        />
                      ))}
                    </div>

                    {/* Mansion Silhouette */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-3/5">
                      {/* Main Building */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2/3 h-3/4 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-lg">
                        {/* Windows */}
                        <div className="grid grid-cols-4 gap-1 p-2 h-1/2 mt-4">
                          {[...Array(8)].map((_, i) => (
                            <div 
                              key={i} 
                              className="bg-yellow-400/80 rounded-sm shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                            />
                          ))}
                        </div>
                        
                        {/* Grand Entrance */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/3 h-1/2 bg-gradient-to-t from-slate-900 to-slate-800 rounded-t-full">
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1/2 h-3/4 bg-yellow-400/60 rounded-t-full"></div>
                        </div>
                      </div>

                      {/* Left Wing */}
                      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-lg">
                        <div className="grid grid-cols-2 gap-1 p-1 h-1/2 mt-2">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-yellow-400/70 rounded-sm" />
                          ))}
                        </div>
                      </div>

                      {/* Right Wing */}
                      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-lg">
                        <div className="grid grid-cols-2 gap-1 p-1 h-1/2 mt-2">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-yellow-400/70 rounded-sm" />
                          ))}
                        </div>
                      </div>

                      {/* Roof Elements */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-2/3 h-8 bg-slate-600 clip-triangle"></div>
                      <div className="absolute -top-3 left-0 w-1/3 h-4 bg-slate-600 clip-triangle-small"></div>
                      <div className="absolute -top-3 right-0 w-1/3 h-4 bg-slate-600 clip-triangle-small"></div>
                    </div>

                    {/* Property Management Icons Floating */}
                    <div className="absolute top-4 left-4 bg-violet-600/20 backdrop-blur-sm rounded-lg p-2 border border-violet-500/30">
                      <CalendarCheck2 className="h-4 w-4 text-violet-300" />
                    </div>
                    <div className="absolute top-4 right-4 bg-blue-600/20 backdrop-blur-sm rounded-lg p-2 border border-blue-500/30">
                      <MessageCircle className="h-4 w-4 text-blue-300" />
                    </div>
                    <div className="absolute bottom-20 right-8 bg-green-600/20 backdrop-blur-sm rounded-lg p-2 border border-green-500/30">
                      <BarChart3 className="h-4 w-4 text-green-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Floating stats */}
              <div className="absolute -bottom-4 -left-4 bg-[#0B0B0E] border border-violet-900/40 rounded-xl p-3 shadow-lg hidden sm:block">
                <div className="text-violet-400 text-xs font-medium">Properties Managed</div>
                <div className="text-white text-lg font-bold">2,847+</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-[#0B0B0E] border border-violet-900/40 rounded-xl p-3 shadow-lg hidden sm:block">
                <div className="text-violet-400 text-xs font-medium">Time Saved</div>
                <div className="text-white text-lg font-bold">5h/week</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const LandingPage = () => {
  // Waitlist state management
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const inputRef = useRef(null);

  // Simple input change handler with useCallback to prevent re-renders
  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
  }, []);

  // Waitlist form handler with useCallback to prevent re-renders
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Import waitlistAPI from services
      const { waitlistAPI } = await import('../services/api');
      
      // Use the new waitlistAPI service
      const response = await waitlistAPI.join({
        email,
        source: 'landing_page'
      });
      
      console.log('✅ Successfully joined waitlist:', response);
      setIsSubmitted(true);
      setEmail('');
      
    } catch (error) {
      console.error('Waitlist API error:', error);
      
      // Fallback to Supabase if API fails
      try {
        console.log('Falling back to Supabase...');
        
        // First check if email already exists
        const { data: existingData } = await supabase
          .from('waitlist')
          .select('email')
          .eq('email', email)
          .single();
          
        if (existingData) {
          console.log('Email already exists in waitlist:', existingData);
          // Email exists but we'll treat it as success
          setIsSubmitted(true);
          setEmail('');
          return;
        }
        
        const { data, error } = await supabase
          .from('waitlist')
          .insert([
            {
              email: email,
              source: 'landing_page',
              created_at: new Date().toISOString()
            }
          ])
          .select();

        if (error) {
          // If still getting duplicate key error, treat as success
          if (error.code === '23505') { // Duplicate key violation
            console.log('Email already exists in waitlist (race condition)');
            setIsSubmitted(true);
            setEmail('');
            return;
          }
          console.error('Supabase error:', error);
          alert("Could not join the waitlist. Try again later.");
          return;
        }

        console.log('✅ Successfully stored in Supabase:', data);
        setIsSubmitted(true);
        setEmail('');
      } catch (supabaseError) {
        console.error('Both API and Supabase failed:', supabaseError);
        alert("Network error. Please try again or contact us directly.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [email]); // Dependencies for useCallback

  // Header Component
  const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    return (
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
            
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <Link to="/features" className="text-slate-400 hover:text-white transition-colors text-sm lg:text-base">Features</Link>
              <Link to="/pricing" className="text-slate-400 hover:text-white transition-colors text-sm lg:text-base">Pricing</Link>
              <Link to="/about" className="text-slate-400 hover:text-white transition-colors text-sm lg:text-base">About</Link>
              <Link to="/contact" className="text-slate-400 hover:text-white transition-colors text-sm lg:text-base">Contact</Link>
            </nav>
            
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
              <Link to="/login">
                <Button 
                  variant="outline"
                  className="border-violet-600/40 hover:border-violet-600 text-white text-sm lg:text-base px-3 lg:px-4"
                >
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button 
                  className="bg-violet-600 hover:bg-violet-700 shadow-[0_0_24px_rgba(124,58,237,.35)] text-sm lg:text-base px-3 lg:px-4"
                >
                  Get Started
                </Button>
              </Link>
              <Button 
                onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-violet-600/20 hover:bg-violet-600/30 text-sm lg:text-base px-3 lg:px-4"
              >
                ✨ Join Waitlist
              </Button>
            </div>
            
            <button 
              className="md:hidden text-slate-400 hover:text-white p-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
          
          {isMenuOpen && (
            <div className="md:hidden border-t border-slate-800 py-4">
              <nav className="flex flex-col space-y-3">
                <Link to="/features" className="text-slate-400 hover:text-white transition-colors py-2">Features</Link>
                <Link to="/pricing" className="text-slate-400 hover:text-white transition-colors py-2">Pricing</Link>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors py-2">About</Link>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors py-2">Contact</Link>
                <div className="flex flex-col space-y-2 pt-3 border-t border-slate-800">
                  <Link to="/login">
                    <Button 
                      variant="outline"
                      className="border-violet-600/40 hover:border-violet-600 text-white justify-start py-3 w-full"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button 
                      className="bg-violet-600 hover:bg-violet-700 justify-start py-3 w-full"
                    >
                      Get Started
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-violet-600/20 hover:bg-violet-600/30 justify-start py-3 w-full"
                  >
                    ✨ Join Waitlist
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    );
  };

  // Demo Section Component
  const DemoSection = () => {
    return (
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-[#0E0E12] to-[#0A0A0A]">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-violet-700/70 text-white border border-violet-700/50 mb-4">How It Works</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6">
              See PropNova in Action
            </h2>
            <p className="text-slate-300 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto">
              Three simple steps to transform your property management workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,.3)]">
                  <PlugZap className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Connect & Sync</h3>
              <p className="text-slate-300 text-sm sm:text-base">
                Link your Airbnb, Booking.com, and VRBO accounts in under 2 minutes. Watch as all your calendars sync automatically.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,.3)]">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Automate Everything</h3>
              <p className="text-slate-300 text-sm sm:text-base">
                Set up smart messaging templates and workflows. PropNova handles check-ins, house rules, and follow-ups automatically.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,.3)]">
                  <BarChart3 className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Scale & Grow</h3>
              <p className="text-slate-300 text-sm sm:text-base">
                Monitor performance, get insights, and scale your property portfolio with confidence. More properties, less work.
              </p>
            </motion.div>
          </div>

          {/* Demo Video Placeholder */}
          <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
            <Card className="bg-[#0B0B0E] border border-violet-900/40 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video w-full bg-gradient-to-br from-[#0E0E12] to-[#141424] relative flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-violet-600/20 rounded-full flex items-center justify-center mb-4">
                      <Monitor className="h-10 w-10 text-violet-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Interactive Demo</h3>
                    <p className="text-slate-300 mb-4">Watch PropNova in action (Available at launch)</p>
                    <Badge className="bg-violet-700/70 text-white border border-violet-500/40">Coming September 11</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  };

  // Built for SA Component
  const BuiltForSA = () => {
    return (
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-b from-[#0A0A0A] to-[#0E0E12]">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-3 sm:space-y-4">
            <Badge className="bg-violet-700/70 text-white border border-violet-700/50 text-xs sm:text-sm">South Africa Ready</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white">Built for South African Property Pros</h2>
            <p className="text-slate-300 text-base sm:text-lg lg:text-xl max-w-3xl">
              Professional tools designed for local hosts and agencies—simple, modern, and built for growth on Earth and beyond.
            </p>
          </div>
        </div>
      </section>
    );
  };

  // Features Component  
  const Features = () => {
    const features = [
      {
        icon: Monitor,
        title: "Unified Command Center",
        desc: "Dashboard that brings all your properties, bookings, and communications into perfect orbit.",
        bullets: ["Real-time overview", "Smart insights", "Performance metrics"]
      },
      {
        icon: CalendarCheck2,
        title: "Smart Calendar Sync",
        desc: "Prevent double bookings across Airbnb, Booking.com, and VRBO.",
        bullets: ["Two-way sync", "Instant date blocking", "Multi-platform alignment"]
      },
      {
        icon: Send,
        title: "Auto Messaging That Lands",
        desc: "Effortless check-ins, house rules and follow-ups—always on time.",
        bullets: ["SA-ready templates", "Auto-scheduled messages", "Multi-language support"]
      },
      {
        icon: PlugZap,
        title: "Workflows on Autopilot",
        desc: "Let PropNova handle the repetitive ops while you scale.",
        bullets: ["Zapier & Make integration", "Custom cosmic workflows", "Smart notifications"]
      }
    ];

    return (
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-[#0A0A0A]">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-violet-700/70 text-white border border-violet-700/50 mb-4">Features at a glance</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6">
              Turn property chaos into effortless orbit
            </h2>
            <p className="text-slate-300 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto">
              One mission control for dashboard, calendar sync, guest comms, and automations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card className="h-full bg-[#0B0B0E] border border-violet-900/40 hover:border-violet-700/60 transition-colors">
                    <CardContent className="p-4 sm:p-6 h-full flex flex-col">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-900/30 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-violet-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-slate-300 mb-3 sm:mb-4 text-sm sm:text-base flex-grow">{feature.desc}</p>
                      <ul className="space-y-1 text-slate-300 text-xs sm:text-sm">
                        {feature.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-violet-400 flex-shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
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

  // Time Savings Component
  const TimeSavings = () => {
    return (
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-[#0E0E12] to-[#0A0A0A]">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6">Reclaim Your Orbit of Time</h2>
              <p className="text-slate-300 text-base sm:text-lg lg:text-xl mb-6">
                With PropNova, hosts typically save <span className="text-white font-semibold">5 hours every week</span>—that's <span className="text-white font-semibold">20 hours per month</span>.
              </p>
              <ul className="space-y-3 sm:space-y-4 text-slate-300 text-sm sm:text-base max-w-md mx-auto lg:mx-0">
                <li className="flex items-center gap-3">
                  <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-violet-400 flex-shrink-0" />
                  <span>Half a full work week back every month</span>
                </li>
                <li className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-violet-400 flex-shrink-0" />
                  <span>R2,000+ in monthly time value for most SA hosts</span>
                </li>
                <li className="flex items-center gap-3">
                  <StarsIcon className="h-4 w-4 sm:h-5 sm:w-5 text-violet-400 flex-shrink-0" />
                  <span>More capacity to grow, or more life on Earth 🌍</span>
                </li>
              </ul>
            </div>
            <Card className="bg-[#0B0B0E] border border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl text-center lg:text-left">What could you do with 20 extra hours?</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 space-y-2 sm:space-y-3 text-sm sm:text-base">
                <p>• Welcome more guests</p>
                <p>• Grow your property portfolio</p>
                <p>• Step out of the grind and recharge</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  };

  // Pricing Component
  const Pricing = () => {
    const plans = [
      {
        name: "Solo Explorer",
        price: "Free",
        period: "14-day trial",
        badge: "✨ Starter",
        features: [
          "Up to 2 properties",
          "Basic sync & templates", 
          "Email support",
          "Core automations"
        ]
      },
      {
        name: "Expanding Orbit", 
        price: "R199",
        period: "per month",
        badge: "🚀 Growth",
        popular: true,
        features: [
          "Up to 10 properties",
          "Advanced automations",
          "Analytics & reports",
          "Priority support",
          "Custom workflows"
        ]
      },
      {
        name: "Galactic Leader",
        price: "Custom",
        period: "pricing",
        badge: "🌌 Agency",
        features: [
          "Unlimited properties",
          "White-label options", 
          "Dedicated support",
          "Custom integrations",
          "Team management"
        ]
      }
    ];

    return (
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-[#0A0A0A] to-[#0E0E12]">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6">
              Choose Your Cosmic Plan
            </h2>
            <p className="text-slate-300 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees, no long-term contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="h-full"
              >
                <Card className={`relative h-full flex flex-col ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-[#0B0B0E] to-[#121225] border-violet-800 shadow-[0_0_60px_rgba(124,58,237,.15)]' 
                    : 'bg-[#0B0B0E] border border-slate-800'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-violet-600 text-white text-xs sm:text-sm">Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                    <div className="text-center mb-6 flex-shrink-0">
                      <Badge className="bg-violet-700/70 text-white border border-violet-700/50 mb-3 text-xs sm:text-sm">
                        {plan.badge}
                      </Badge>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-2xl sm:text-3xl font-bold text-white">{plan.price}</span>
                        <span className="text-slate-400 ml-1 text-sm sm:text-base">/{plan.period}</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-2 sm:space-y-3 mb-6 flex-grow">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-300 text-sm sm:text-base">
                          <CheckCircle className="h-4 w-4 text-violet-400 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link to="/register">
                      <Button 
                        className={`w-full mt-auto text-sm sm:text-base ${
                          plan.popular 
                            ? 'bg-violet-600 hover:bg-violet-700' 
                            : 'bg-violet-700/40 hover:bg-violet-700/60 border border-violet-700/40'
                        }`}
                      >
                        {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // FAQ Component
  const FAQ = () => {
    const faqs = [
      {
        question: "How does calendar sync work?",
        answer: "Our calendar sync works automatically and reliably. Connect your Airbnb, Booking.com, and VRBO accounts, and PropNova keeps all calendars perfectly aligned in real-time."
      },
      {
        question: "Is Payfast integration included?",
        answer: "Yes! Payfast is built-in for South African hosts. Accept payments securely with zero additional setup required."
      },
      {
        question: "How long does setup take?",
        answer: "Setup takes about 5 minutes. Connect your accounts, customize your messaging templates, and you're ready to automate your property management."
      },
      {
        question: "What happens after launch?",
        answer: "Waitlist members get 50% off their first year, priority onboarding support, and exclusive access to beta features."
      },
      {
        question: "Can I cancel anytime?",
        answer: "Absolutely. No long-term contracts, no cancellation fees. Your data stays yours, and you can export everything if needed."
      }
    ];

    return (
      <section className="py-14 md:py-20 bg-black">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-300 text-lg">
              Everything you need to know about PropNova
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-violet-900/40">
                  <th className="text-left py-6 px-6 text-violet-400 font-semibold text-lg">Question</th>
                  <th className="text-left py-6 px-6 text-violet-400 font-semibold text-lg">Answer</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((faq, index) => (
                  <tr key={index} className="border-b border-slate-800 hover:bg-slate-900/20 transition-colors">
                    <td className="py-6 px-6 text-white font-medium align-top w-1/3">
                      {faq.question}
                    </td>
                    <td className="py-6 px-6 text-slate-300 align-top">
                      {faq.answer}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  };

  // Footer Component
  const Footer = () => {
    return (
      <footer className="bg-[#0A0A0A] border-t border-slate-800 py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/novaprop-logo.jpeg" alt="NovaProp" className="h-8 w-8 rounded-lg shadow-[0_0_20px_rgba(124,58,237,.45)]" />
                <span className="text-xl font-bold text-white">PropNova</span>
              </div>
              <p className="text-slate-400 mb-4">
                Professional property management made simple. Built for South African hosts and agencies.
              </p>
              <p className="text-slate-500 text-sm">
                © 2025 PropNova. All rights reserved.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] text-white starfield overflow-x-hidden" style={{ backgroundColor: '#0A0A0A' }}>
      <Header />
      <Hero 
        email={email}
        isSubmitted={isSubmitted}
        isSubmitting={isSubmitting}
        handleEmailChange={handleEmailChange}
        handleSubmit={handleSubmit}
        inputRef={inputRef}
      />
      <DemoSection />
      <BuiltForSA />
      <Features />
      <TimeSavings />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
};

export default LandingPage;
