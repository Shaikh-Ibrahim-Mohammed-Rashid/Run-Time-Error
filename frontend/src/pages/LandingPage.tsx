import { Link, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import Spline from '@splinetool/react-spline';
import { 
  ArrowRight, Brain, Shield, 
  MessageCircle, Heart, Stethoscope,
  Activity, Calendar, UserCog, Plus, Minus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import { useAuth } from '@clerk/clerk-react';

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="group relative bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 
      hover:border-blue-500/50 transition-all duration-500 overflow-hidden
      hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]"
  >
    {/* Gradient overlay on hover */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/0 to-blue-600/0 
      opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
    
    {/* Animated circle background */}
    <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full 
      group-hover:scale-150 transition-transform duration-500" />
    
    <div className="relative z-10">
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 w-16 h-16 rounded-2xl 
        flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300
        shadow-[0_0_20px_rgba(59,130,246,0.3)]">
        <Icon className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
      </div>
      <h3 className="text-white font-bold text-xl mb-3 group-hover:text-blue-300 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
        {description}
      </p>
    </div>
  </motion.div>
);

const StatCard = ({ number, label }: { number: string, label: string }) => (
  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
    <h3 className="text-3xl font-bold text-blue-400 mb-2">{number}</h3>
    <p className="text-gray-300">{label}</p>
  </div>
);

const TestimonialCard = ({ text, author, role, delay }: { text: string, author: string, role: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10
      hover:border-blue-500/50 transition-all duration-500"
  >
    <p className="text-gray-300 italic mb-6">"{text}"</p>
    <div>
      <h4 className="text-white font-semibold">{author}</h4>
      <p className="text-blue-400">{role}</p>
    </div>
  </motion.div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left"
      >
        <span className="text-lg font-semibold text-white">{question}</span>
        {isOpen ? (
          <Minus className="w-5 h-5 text-blue-400" />
        ) : (
          <Plus className="w-5 h-5 text-blue-400" />
        )}
      </button>
      {isOpen && (
        <p className="text-gray-400 pb-6">{answer}</p>
      )}
    </div>
  );
};

const LargeFeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="group relative bg-white/5 backdrop-blur-lg p-12 rounded-2xl border border-white/10 
      hover:border-blue-500/50 transition-all duration-500 overflow-hidden
      hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] h-full"
  >
    {/* Gradient overlay on hover */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/0 to-blue-600/0 
      opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
    
    {/* Animated circle background */}
    <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full 
      group-hover:scale-150 transition-transform duration-500" />
    
    <div className="relative z-10">
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 w-24 h-24 rounded-2xl 
        flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300
        shadow-[0_0_20px_rgba(59,130,246,0.3)]">
        <Icon className="w-12 h-12 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
      </div>
      <h3 className="text-white font-bold text-2xl mb-4 group-hover:text-blue-300 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-400 text-lg group-hover:text-gray-300 transition-colors duration-300">
        {description}
      </p>
    </div>
  </motion.div>
);

const ScatteredFeatures = () => (
  <div className="relative max-w-7xl mx-auto px-4">
    {/* First Row */}
    <div className="grid grid-cols-12 gap-6 mb-6">
      <motion.div className="col-span-12 md:col-span-5"
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ delay: 0.2 }}
      >
        <LargeFeatureCard 
          icon={Brain} 
          title="AI Diagnostics" 
          description="Advanced neural networks powered by cutting-edge algorithms provide accurate health analysis and personalized recommendations." 
          delay={0} 
        />
      </motion.div>
      
      <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
        >
          <FeatureCard 
            icon={Calendar} 
            title="Smart Scheduling" 
            description="AI-optimized appointment management" 
            delay={0} 
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
        >
          <FeatureCard 
            icon={Activity} 
            title="Vitals Tracking" 
            description="Real-time health metrics monitoring" 
            delay={0} 
          />
        </motion.div>
      </div>
    </div>

    {/* Second Row */}
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }}
        >
          <FeatureCard 
            icon={Shield} 
            title="Secure Platform" 
            description="Military-grade data encryption" 
            delay={0} 
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.6 }}
        >
          <FeatureCard 
            icon={MessageCircle} 
            title="24/7 AI Support" 
            description="Round-the-clock medical assistance" 
            delay={0} 
          />
        </motion.div>
      </div>

      <motion.div className="col-span-12 md:col-span-5"
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ delay: 0.7 }}
      >
        <LargeFeatureCard 
          icon={Heart} 
          title="Wellness AI" 
          description="Comprehensive AI-driven wellness programs tailored to your unique health profile and goals." 
          delay={0} 
        />
      </motion.div>
    </div>
  </div>
);

const LandingPage = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#1E293B] overflow-hidden">
      {/* Content */}
      <div className="relative">
        {/* Navigation - Simplified */}
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 w-full p-6 z-50"
        >
          <div className="max-w-7xl mx-auto flex justify-between items-center relative">
            <motion.div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-blue-400" />
              <span className="text-white font-bold text-xl">HealthMate</span>
            </motion.div>
            <div className="flex items-center space-x-4">
                  {isSignedIn ? (
                    <Link
                      to="/dashboard"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full 
                        transition-all duration-300 flex items-center space-x-2"
                    >
                  <span>My Health Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                <>
                      <Link
                        to="/sign-in"
                    className="text-white hover:text-blue-400 transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/sign-up"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full 
                          transition-all duration-300"
                      >
                    Get Started
                      </Link>
                </>
              )}
            </div>
          </div>
        </motion.nav>

        {/* Hero Section with Spline */}
        <div className="relative min-h-screen">
          {/* Spline Background */}
          <div className="absolute inset-0 z-0 mt-32 pointer-events-none select-none opacity-75">
            <Spline 
              className="w-full h-full object-cover"
              scene="https://prod.spline.design/T13EdlmOI6DrBf1t/scene.splinecode"
              onLoad={(splineApp) => {
                if (splineApp) {
                  const canvas = document.querySelector('canvas');
                  if (canvas) {
                    canvas.style.pointerEvents = 'none';
                  }
                }
              }}
            />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center p-8 rounded-3xl border border-white/10
                bg-gradient-to-b from-white/10 to-transparent backdrop-blur-lg
                shadow-[0_0_50px_rgba(59,130,246,0.2)]"
            >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                  <span className="text-white">Your </span>
              <TypeAnimation
                sequence={[
                      'Virtual Health Assistant',
                      1500,
                      'Medical Companion',
                      1500,
                      'Symptom Analyzer',
                      1500,
                      'Healthcare Navigator',
                      1500,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
              />
            </h1>

            <motion.p 
                  className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
            >
                  Experience the future of healthcare with AI-powered medical guidance.
                  <br />
                  <span className="text-blue-400">Smart diagnostics</span> • <span className="text-cyan-400">Personalized care</span> • <span className="text-indigo-400">24/7 support</span>
            </motion.p>
              </motion.div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
              <FeatureCard
                    icon={Stethoscope}
                    title="Smart Diagnostics"
                    description="AI-powered health analysis with 95% accuracy"
                    delay={0}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
              <FeatureCard
                    icon={Activity}
                    title="Health Tracking"
                    description="Real-time monitoring of vital health metrics"
                    delay={0}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
              <FeatureCard
                    icon={UserCog}
                    title="Custom Care Plans"
                    description="Personalized healthcare recommendations"
                    delay={0}
                  />
                </motion.div>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="mt-12"
            >
              <Link
                  to="/sign-up"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 
                    to-blue-600 text-white rounded-full text-lg font-semibold hover:from-cyan-600 
                    hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-blue-500/25
                  group"
              >
                  Start Your Health Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
          </div>
        </div>

        {/* Stats Section - Updated */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard number="1M+" label="Health Assessments" />
            <StatCard number="99.9%" label="User Satisfaction" />
            <StatCard number="24/7" label="Medical Support" />
            <StatCard number="100+" label="Health Conditions" />
          </div>
        </div>

        {/* Features Grid - Healthcare Focused */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-center mb-16"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Complete Healthcare Solution
            </span>
          </motion.h2>
          
          <ScatteredFeatures />
        </div>

        {/* Testimonials Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-center mb-16"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              What Our Users Say
            </span>
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              text="HealthMate has revolutionized how I manage my health. The AI diagnostics are incredibly accurate and helpful."
              author="Dr. Sarah Johnson"
              role="Medical Professional"
              delay={0.2}
            />
            <TestimonialCard 
              text="The 24/7 AI support has been a game-changer for my family. It's like having a doctor on call at all times."
              author="Michael Chen"
              role="Parent of Two"
              delay={0.4}
            />
            <TestimonialCard 
              text="As someone with chronic conditions, the medication tracking and health analytics have made my life so much easier."
              author="Emma Thompson"
              role="Patient"
              delay={0.6}
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-center mb-16"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Frequently Asked Questions
            </span>
          </motion.h2>
          
          <div className="space-y-4">
            <FAQItem 
              question="How accurate is the AI diagnosis system?"
              answer="Our AI system has achieved a 95% accuracy rate in preliminary diagnoses, verified by medical professionals. However, it's designed to be a supportive tool and not a replacement for professional medical advice."
            />
            <FAQItem 
              question="Is my health data secure?"
              answer="Yes, we implement military-grade encryption and are fully HIPAA compliant. Your health data is stored securely and never shared without your explicit consent."
            />
            <FAQItem 
              question="Can I use HealthMate in emergency situations?"
              answer="While HealthMate can provide immediate guidance, it's not designed for emergencies. In case of medical emergencies, please call your local emergency services immediately."
            />
            <FAQItem 
              question="How does the 24/7 AI support work?"
              answer="Our AI system is available round-the-clock to answer health-related questions, provide symptom analysis, and offer general health guidance. It's continuously learning and updated with the latest medical information."
            />
          </div>
        </div>

        {/* Footer - Simplified */}
        <footer className="relative z-10 border-t border-white/10 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-bold text-lg mb-4">HealthMate</h3>
                <p className="text-gray-400">Your trusted AI healthcare companion</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Services</h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="hover:text-white cursor-pointer">Health Assessment</li>
                  <li className="hover:text-white cursor-pointer">Symptom Checker</li>
                  <li className="hover:text-white cursor-pointer">Medical Records</li>
                  <li className="hover:text-white cursor-pointer">Support</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="hover:text-white cursor-pointer">Privacy Policy</li>
                  <li className="hover:text-white cursor-pointer">Terms of Service</li>
                  <li className="hover:text-white cursor-pointer">HIPAA Compliance</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
              <p>© 2024 HealthMate. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage; 