import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Heart, 
  LayoutDashboard, 
  MessageSquare, 
  User, 
  Calendar, 
  FileText,  
  HelpCircle,
  Pill,
  Menu,
  X,
  Target,
  Activity,
  Stethoscope,
  ClipboardList,
  Brain
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useTour } from '../context/TourContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const { openTour } = useTour();

  // Add a function to handle link clicks
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Overview', tourClass: 'tour-dashboard' },
    { path: '/dashboard/chatbot', icon: MessageSquare, label: 'Aarogya AI', tourClass: 'tour-ai-assistant' },
    { path: '/dashboard/userinfo', icon: User, label: 'User Data' },
    { path: '/dashboard/reports', icon: FileText, label: 'Reports' },
    { path: '/dashboard/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/dashboard/goals', icon: Target, label: 'Goals' },
    { path: '/dashboard/live', icon: Activity, label: 'HealthAI Live' },
    { path: '/dashboard/mri-scan', icon: Brain, label: 'MRI Scan' },
    // { path: '/dashboard/diagnosis', icon: Stethoscope, label: 'Diagnosis' },
    // { path: '/dashboard/health-plan', icon: ClipboardList, label: 'Health Plan' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 
          shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <motion.div
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700 z-50 
          lg:translate-x-0 transition-transform duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4">
            <Link 
              to="/" 
              className="flex items-center space-x-3 tour-logo"
              onClick={handleLinkClick}
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">HealthMate</span>
            </Link>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={handleLinkClick}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      } ${item.tourClass || ''}`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Link 
              to="/dashboard/profile"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors p-2 rounded-lg group tour-profile"
            >
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500 dark:ring-blue-400"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {user?.fullName || 'User Name'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.primaryEmailAddress?.emailAddress || 'email@example.com'}
                </p>
              </div>
            </Link>

            {/* Tutorial Button */}
            <button
              onClick={() => {
                openTour();
                setIsMobileMenuOpen(false);
              }}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Take a Tour
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar; 