import { useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  Settings, 
  Shield, 
  User, 
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

const Profile = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeSection, setActiveSection] = useState('personal');
  
  // Form state for personal info
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const sidebarItems = [
    { icon: User, label: 'Personal Info', section: 'personal' },
    { icon: Shield, label: 'Security', section: 'security' },
    { icon: Settings, label: 'Notifications', section: 'notifications' }
  ];

  const handleProfileUpdate = async () => {
    try {
      await user?.update({
        firstName,
        lastName,
      });

      await user?.update({
        // publicMetadata: {
        //   phoneNumber,
        //   location,
        //   dateOfBirth
        // }
      });

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const renderPersonalInfoSection = () => {
    return (
      <div className="space-y-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-800 dark:to-indigo-900 mx-auto flex items-center justify-center shadow-xl">
            {user?.imageUrl ? (
              <img 
                src={user.imageUrl} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-16 w-16 text-indigo-600 dark:text-indigo-300" />
            )}
          </div>
          <button 
            onClick={() => toast.info('Image upload coming soon!')}
            className="absolute bottom-0 right-1/2 translate-x-12 translate-y-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Camera className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="flex items-center px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 absolute ml-3" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 absolute ml-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date of Birth
              </label>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 absolute ml-3" />
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t dark:border-gray-700">
          <button 
            onClick={() => {
              setFirstName(user?.firstName || '');
              setLastName(user?.lastName || '');
              setPhoneNumber('');
              setLocation('');
              setDateOfBirth('');
            }}
            className="px-6 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleProfileUpdate}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  };

  const renderSecuritySection = () => {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Two-factor authentication is enabled
            </span>
          </div>
        </div>
        {/* Add security settings here */}
      </div>
    );
  };

  const renderNotificationsSection = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {['Email', 'Push', 'SMS'].map((type) => (
            <div key={type} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-900 dark:text-white font-medium">{type} Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalInfoSection();
      case 'security':
        return renderSecuritySection();
      case 'notifications':
        return renderNotificationsSection();
      default:
        return renderPersonalInfoSection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-indigo-50 
      dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 py-8 sm:py-12">
      <Toaster richColors />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Enhanced Sidebar */}
          <motion.div 
            className="lg:col-span-3 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl 
              border border-gray-200/50 dark:border-gray-700/50">
              {/* User Info Section */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 
                      p-1 shadow-lg group-hover:from-indigo-500 group-hover:to-purple-600 transition-all duration-300">
                      {user?.imageUrl ? (
                        <img 
                          src={user.imageUrl} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 
                          flex items-center justify-center">
                          <User className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => toast.info('Image upload coming soon!')}
                      className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-2 rounded-full 
                        shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors 
                        border border-gray-200 dark:border-gray-700"
                    >
                      <Camera className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="p-4">
                <nav className="space-y-2">
                  {sidebarItems.map((item) => (
                    <button 
                      key={item.section}
                      onClick={() => setActiveSection(item.section)}
                      className={`
                        w-full px-4 py-3 rounded-xl flex items-center transition-all duration-300
                        ${activeSection === item.section 
                          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg hover:from-indigo-600 hover:to-indigo-700' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }
                      `}
                    >
                      <item.icon 
                        className={`h-5 w-5 mr-3 ${
                          activeSection === item.section 
                            ? 'text-white' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`} 
                      />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>

                <button 
                  onClick={() => signOut()}
                  className="w-full mt-6 px-4 py-3 rounded-xl flex items-center justify-center
                    bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 
                    hover:to-red-700 transition-all duration-300 shadow-lg"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Main Content */}
          <motion.div 
            className="lg:col-span-9"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl 
              border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r 
                    from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
                    {sidebarItems.find(item => item.section === activeSection)?.label}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage your {activeSection} settings and preferences
                  </p>
                </div>
              </div>
              {renderContent()}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


