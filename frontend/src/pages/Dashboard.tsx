import { Activity, AlertCircle, Brain, FileText, MessageSquare, User, Sparkles, Target, Bell, Heart, Shield, Clock, Stethoscope, ChevronRight, ChevronLeft, Phone, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const InsightCard = ({ title, value, subtext, icon: Icon, color }: { title: string, value: string, subtext: string, icon: any, color: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300
      group hover:translate-y-[-2px] cursor-pointer relative overflow-hidden border border-gray-100`}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10 rounded-full ${color.replace('border', 'bg')}`} />
    <div className="flex items-start justify-between relative z-10">
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-3 rounded-xl ${color.replace('border', 'bg')}/10 backdrop-blur-sm`}>
            <Icon className={`w-6 h-6 ${color.replace('border', 'text')}`} />
          </div>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-xs text-gray-500 max-w-[200px]">{subtext}</p>
      </div>
    </div>
  </motion.div>
);

const AIRecommendation = ({ title, description, icon: Icon, delay }: { title: string, description: string, icon: any, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300
      hover:translate-x-1 cursor-pointer border border-gray-100 group"
  >
    <div className="flex items-start space-x-4">
      <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h4>
        <p className="text-gray-600 mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

const QuickActionButton = ({ icon: Icon, title, color, onClick }: { icon: any, title: string, color: string, onClick?: () => void }) => (
  <motion.button 
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`w-full bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all
      flex items-center space-x-4 group relative overflow-hidden border border-gray-100`}
    onClick={onClick}
  >
    <div className={`p-3 ${color} rounded-xl transition-colors`}>
      <Icon className="w-5 h-5 text-white" />
      </div>
    <div className="flex-1 text-left">
      <span className="font-medium text-gray-900 block">{title}</span>
      <span className="text-xs text-gray-500">Click to access</span>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
  </motion.button>
);

const isProfileComplete = () => {
  const savedData = localStorage.getItem('health_profile_data');
  if (!savedData) return false;
  
  const data = JSON.parse(savedData);
  // Check if all major sections are filled
  return data.personal_details.name && 
         data.personal_details.email &&
         data.medical_history.chronic_conditions.length > 0 &&
         data.medical_history.lifestyle.smoking !== '' &&
         data.medical_history.family_history.father.condition !== '';
};

// Add these interfaces
interface HealthProfile {
  personal_details: {
    name: string;
    email: string;
    // ... other fields
  };
  medical_history: {
    chronic_conditions: string[];
    lifestyle: {
      smoking: string;
      exercise: string;
      // ... other fields
    };
    family_history: {
      father: { condition: string };
      // ... other fields
    };
  };
}

interface AIInteraction {
  timestamp: number;
  type: string;
}

// Add this interface for initial health data
interface InitialHealthData {
  health_score: number;
  previous_health_score: number;
  wellness_goals: {
    completed: number;
    total: number;
    recent: string[];
  };
  ai_interactions: Array<{
    timestamp: number;
    type: string;
  }>;
  health_metrics: {
    heart_rate: { value: string; trend: string; };
    blood_pressure: { value: string; trend: string; };
    sleep_score: { value: string; trend: string; };
    immunity: { value: string; trend: string; };
  };
  upcoming_activities: Array<{
    date: string;
    title: string;
    type: string;
    time: string;
  }>;
}

// Function to set initial health data when user completes registration
const setInitialHealthData = (userId: string) => {
  const initialData: InitialHealthData = {
    health_score: 75,
    previous_health_score: 70,
    wellness_goals: {
      completed: 2,
      total: 5,
      recent: ['Exercise 3 times a week', 'Drink 8 glasses of water']
    },
    ai_interactions: [
      { timestamp: Date.now() - 86400000, type: 'health_check' },
      { timestamp: Date.now() - 172800000, type: 'consultation' }
    ],
    health_metrics: {
      heart_rate: { value: '72 bpm', trend: '+2%' },
      blood_pressure: { value: '120/80', trend: '-5%' },
      sleep_score: { value: '85%', trend: '+8%' },
      immunity: { value: '92%', trend: '+3%' }
    },
    upcoming_activities: [
      // {
      //   date: 'Today',
      //   title: 'Annual Health Checkup',
      //   type: 'Medical Appointment',
      //   time: '2:30 PM'
      // },
      // {
      //   date: 'Tomorrow',
      //   title: 'Fitness Assessment',
      //   type: 'Wellness Check',
      //   time: '10:00 AM'
      // }
    ]
  };

  // Store the initial data in localStorage with user ID
  Object.entries(initialData).forEach(([key, value]) => {
    localStorage.setItem(`${userId}_${key}`, JSON.stringify(value));
  });
};

// Update the utility functions to be user-specific
const getHealthProfile = (userId: string): HealthProfile | null => {
  const savedData = localStorage.getItem(`${userId}_health_profile_data`);
  return savedData ? JSON.parse(savedData) : null;
};

const getAIInteractions = (userId: string): AIInteraction[] => {
  const interactions = localStorage.getItem(`${userId}_ai_interactions`);
  return interactions ? JSON.parse(interactions) : [];
};

const getHealthScore = (userId: string): number => {
  const score = localStorage.getItem(`${userId}_health_score`);
  return score ? parseInt(score) : 0;
};

const getWellnessGoals = (userId: string) => {
  const goals = localStorage.getItem(`${userId}_wellness_goals`);
  return goals ? JSON.parse(goals) : {
    completed: 0,
    total: 5,
    recent: []
  };
};

const calculateHealthScoreChange = (userId: string): number => {
  const previousScore = localStorage.getItem(`${userId}_previous_health_score`);
  const currentScore = getHealthScore(userId);
  return previousScore ? currentScore - parseInt(previousScore) : 0;
};

const ScheduleEvent = ({ time, title, type, status }: { time: string; title: string; type: string; status: 'upcoming' | 'completed' | 'cancelled' }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-100 transition-all hover:shadow-md"
  >
    <div className="flex-shrink-0">
      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
        status === 'upcoming' ? 'bg-blue-50 text-blue-600' :
        status === 'completed' ? 'bg-green-50 text-green-600' :
        'bg-red-50 text-red-600'
      }`}>
        <span className="text-sm font-semibold">{time.split(' ')[0]}</span>
        <span className="text-xs">{time.split(' ')[1]}</span>
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-0.5 rounded-full text-xs ${
          status === 'upcoming' ? 'bg-blue-50 text-blue-600' :
          status === 'completed' ? 'bg-green-50 text-green-600' :
          'bg-red-50 text-red-600'
        }`}>
          {status}
        </span>
        <span className="text-xs text-gray-500">{type}</span>
    </div>
    </div>
    <Stethoscope className="w-5 h-5 text-gray-400" />
  </motion.div>
);

const HealthMetricCard = ({ title, value, trend, icon: Icon }: { title: string; value: string; trend: string; icon: any; }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-600">{title}</p>
        </div>
      </div>
      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
        trend.includes('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
      }`}>
        {trend}
      </div>
    </div>
  </motion.div>
);

const NotificationBadge = ({ count }: { count: number }) => (
  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
    <span className="text-xs text-white font-medium">{count}</span>
  </div>
);

const healthMetrics = [
  { title: 'Heart Rate', value: '72 bpm', trend: '+2%', icon: Heart },
  { title: 'Blood Pressure', value: '120/80', trend: '-5%', icon: Activity },
  { title: 'Sleep Score', value: '85%', trend: '+8%', icon: Clock },
  { title: 'Immunity', value: '92%', trend: '+3%', icon: Shield }
];

// Add this interface for calendar events
interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  type: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

// Add this constant at the top level of the file
const DAYS_OF_WEEK = [
  { key: 'sun', label: 'S' },
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' }
];

// Update the CalendarView component
const CalendarView = ({ events = [] }: { events?: CalendarEvent[] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startingDayIndex = monthStart.getDay();
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const hasEventOnDay = (date: Date) => {
    return events.some(event => isSameDay(new Date(event.date), date));
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const getDayStyle = (date: Date, isSelected: boolean | null, isCurrentDay: boolean) => {
    const dayEvents = getEventsForDay(date);
    const hasEvents = dayEvents.length > 0;

    return `
      w-8 h-8 relative rounded-full flex items-center justify-center text-sm
      transition-all duration-200 group
      ${isSelected ? 'bg-blue-500 text-white' : hasEvents ? 'hover:bg-blue-50' : 'hover:bg-gray-50'}
      ${isCurrentDay && !isSelected ? 'font-bold text-blue-600' : ''}
      ${hasEvents && !isSelected ? 'font-medium' : 'font-normal'}
    `;
  };

  const getEventIndicatorStyle = (eventCount: number) => {
    if (eventCount === 1) return "h-1.5 w-4 rounded-full bg-blue-500";
    if (eventCount === 2) return "h-1.5 w-4 rounded-full bg-purple-500";
    return "h-1.5 w-4 rounded-full bg-green-500";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      {/* Calendar Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={previousMonth}
              className="p-1 hover:bg-gray-50 rounded-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-gray-50 rounded-md transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Days of Week */}
        <div className="grid grid-cols-7 mt-4">
          {DAYS_OF_WEEK.map((day) => (
            <div 
              key={day.key} 
              className="text-xs font-medium text-gray-400 flex items-center justify-center h-8"
            >
              {day.label}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-2">
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for previous month */}
          {Array.from({ length: startingDayIndex }).map((_, index) => (
            <div key={`empty-${index}`} className="w-8 h-8" />
          ))}
          
          {/* Days of current month */}
          {daysInMonth.map((date) => {
            const dayEvents = getEventsForDay(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isCurrentDay = isToday(date);
            
            return (
              <motion.button
                key={date.toISOString()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(date)}
                className={getDayStyle(date, isSelected, isCurrentDay)}
              >
                <span>{format(date, 'd')}</span>
                {/* Event Indicator */}
                {dayEvents.length > 0 && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
                    <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && getEventsForDay(selectedDate).length > 0 && (
        <div className="border-t border-gray-100 p-3">
          <div className="space-y-2 max-h-[150px] overflow-y-auto">
            {getEventsForDay(selectedDate).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 py-1"
              >
                <div className="w-1 h-1 rounded-full bg-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{event.title}</p>
                  <p className="text-xs text-gray-500">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const QuickActionsSection = () => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
    </div>
    <div className="grid gap-4">
      <Link to="/dashboard/chatbot">
        <QuickActionButton 
          icon={MessageSquare} 
          title="AI Health Chat" 
          color="bg-blue-600"
        />
      </Link>
      <Link to="/dashboard/reports">
        <QuickActionButton 
          icon={FileText} 
          title="Medical Records" 
          color="bg-purple-600"
        />
      </Link>
      <Link to="/dashboard/goals">
        <QuickActionButton 
          icon={Target} 
          title="Health Goals" 
          color="bg-green-600"
        />
      </Link>
    </div>
  </div>
);

const ScheduleSection = () => {
  const sampleEvents: CalendarEvent[] = [
    {
      id: '1',
      date: new Date(),
      title: 'Annual Health Checkup',
      type: 'Medical Appointment',
      time: '9:00 AM',
      status: 'upcoming'
    },
    {
      id: '2',
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      title: 'Fitness Assessment',
      type: 'Wellness Check',
      time: '2:30 PM',
      status: 'upcoming'
    },
    {
      id: '3',
      date: new Date(new Date().setDate(new Date().getDate() + 5)),
      title: 'Nutritionist Consultation',
      type: 'Virtual Meeting',
      time: '4:00 PM',
      status: 'upcoming'
    },
    {
      id: '4',
      date: new Date(new Date().setDate(new Date().getDate() + 7)),
      title: 'Dental Checkup',
      type: 'Medical Appointment',
      time: '11:00 AM',
      status: 'upcoming'
    },
    {
      id: '5',
      date: new Date(new Date().setDate(new Date().getDate() + 12)),
      title: 'Blood Test',
      type: 'Lab Work',
      time: '8:30 AM',
      status: 'upcoming'
    },
    {
      id: '6',
      date: new Date(new Date().setDate(new Date().getDate() + 15)),
      title: 'Mental Health Session',
      type: 'Therapy',
      time: '3:00 PM',
      status: 'upcoming'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
          <p className="text-sm text-gray-500 mt-1">Your upcoming appointments</p>
        </div>
      </div>
      
      <CalendarView events={sampleEvents} />
      
      {/* Compact Today's Events Section */}
      {sampleEvents.filter(event => isSameDay(new Date(event.date), new Date())).length > 0 && (
        <div className="mt-3 px-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-gray-500">Today</h3>
            <span className="text-xs text-blue-600">
              {sampleEvents.filter(event => isSameDay(new Date(event.date), new Date())).length} events
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const AIRecommendationsSection = ({ healthProfile, wellnessGoals }: { 
  healthProfile: HealthProfile | null, 
  wellnessGoals: { completed: number; total: number; } 
}) => (
  <div className="space-y-4">
    {healthProfile?.medical_history?.chronic_conditions && 
     healthProfile.medical_history.chronic_conditions.length > 0 && (
      <AIRecommendation 
        icon={Brain}
        title="Health Management"
        description={`Managing ${healthProfile.medical_history.chronic_conditions.join(', ')}. Regular monitoring recommended.`}
        delay={0.2}
      />
    )}
    {healthProfile?.medical_history?.lifestyle?.exercise && (
      <AIRecommendation 
        icon={Activity}
        title="Exercise Pattern"
        description={`Your ${healthProfile.medical_history.lifestyle.exercise} activity level suggests good fitness habits.`}
        delay={0.4}
      />
    )}
    <AIRecommendation 
      icon={Target}
      title="Goal Progress"
      description={`You've completed ${wellnessGoals.completed} out of ${wellnessGoals.total} wellness goals.`}
      delay={0.6}
    />
  </div>
);

const CallWaitingDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<'input' | 'loading' | 'success'>('input');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.match(/^\d{10}$/)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('number', phoneNumber);

      // Make the API call
      const response = await fetch(`${SERVER_URL}/api/make_call`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to initiate call');
      }

      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        
        // Auto close after success
        setTimeout(() => {
          onClose();
          setStatus('input');
          setPhoneNumber('');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to initiate call');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to book call. Please try again.');
      setStatus('input');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 relative overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {status === 'input' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Book a Call
              </h3>
              <p className="text-sm text-gray-600">
                Enter your phone number and we'll connect you with a healthcare professional
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    bg-white text-gray-900"
                />
                {error && (
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white 
                  rounded-lg transition-colors duration-200"
              >
                Book Call
              </button>
            </form>
          </div>
        )}

        {status === 'loading' && (
          <div className="text-center py-8">
            <div className="relative mb-6">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-blue-100 rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
                className="absolute inset-0 bg-blue-50 rounded-full"
              />
              <div className="relative w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <Phone className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connecting you with a doctor
            </h3>
            <p className="text-gray-600 mb-4">
              Please wait while we process your request
            </p>

            {/* Loading Dots */}
            <div className="flex items-center justify-center gap-1 mt-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
              ))}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full 
              flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Call Booked Successfully!
            </h3>
            <p className="text-gray-600">
              We'll call you at {phoneNumber} within the next 30 minutes
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useUser();
  const firstName = user?.firstName || 'there';
  
  const isRegistered = user && isProfileComplete();
  
  // Add useEffect inside the component
  useEffect(() => {
    if (user && isProfileComplete() && !getHealthProfile(user.id)) {
      setInitialHealthData(user.id);
    }
  }, [user]); // user is now in scope
  
  // Get data from localStorage only if user is registered
  const healthProfile = isRegistered && user ? getHealthProfile(user.id) : null;
  const aiInteractions = isRegistered && user ? getAIInteractions(user.id) : [];
  const healthScore = isRegistered && user ? getHealthScore(user.id) : 0;
  const wellnessGoals = isRegistered && user ? getWellnessGoals(user.id) : {
    completed: 0,
    total: 5,
    recent: []
  };
  const scoreChange = isRegistered && user ? calculateHealthScoreChange(user.id) : 0;
  
  // Calculate recent AI interactions (last 30 days)
  const recentInteractions = aiInteractions.filter(interaction => 
    (Date.now() - interaction.timestamp) < 30 * 24 * 60 * 60 * 1000
  ).length;

  // Show registration prompt if not registered
  if (!isRegistered) {
    return (
      <div className="min-h-screen p-4 lg:p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Your Health Dashboard
            </h1>
            <p className="text-gray-600 mb-8">
              Complete your health profile to unlock personalized insights and recommendations.
            </p>
            <Link
              to="/dashboard/userinfo"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 
                rounded-xl hover:bg-blue-700 transition-all"
            >
              <User className="w-5 h-5" />
              <span>Complete Your Profile</span>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Add state for dialog in Dashboard component
  const [showCallDialog, setShowCallDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Welcome back, <span className="text-blue-600">{firstName}</span>
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              {healthProfile ? 
                'Your health dashboard is ready for review' : 
                'Complete your health profile to get started'}
            </p>
          </motion.div>
          <div className="flex items-center gap-3">
          <motion.button 
            data-tour="new-ai-check"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center space-x-2 bg-blue-600 
              text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md 
              transition-all duration-300"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">New AI Check</span>
          </motion.button>

            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCallDialog(true)}
              className="flex items-center justify-center space-x-2 bg-green-600 
                text-white px-5 py-2.5 rounded-lg hover:bg-green-700 shadow-sm hover:shadow-md 
                transition-all duration-300"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Book a Call</span>
            </motion.button>
          </div>
        </div>

        {/* Alert Banner */}
        {!isProfileComplete() && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-100 rounded-lg p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="ml-3 text-sm text-red-700">
                  Please complete your health profile for personalized recommendations.
                </p>
              </div>
              <Link
                to="/dashboard/userinfo"
                className="sm:ml-auto bg-white text-red-600 px-4 py-2 rounded-lg 
                  text-sm font-medium transition-colors whitespace-nowrap text-center
                  border border-red-100 hover:bg-red-50"
              >
                Complete Profile
              </Link>
            </div>
          </motion.div>
        )}

        {/* Notification Bar */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <NotificationBadge count={3} />
            </div>
            <span className="text-sm text-gray-700">You have 3 new health notifications</span>
          </div>
          <Link 
            to="/dashboard/notifications"
            className="text-blue-600 text-sm font-medium hover:text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            View All
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Insights and Metrics */}
          <div className="lg:col-span-3 space-y-6">
            {/* Insights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <InsightCard 
                title="Health Score" 
                value={`${healthScore}/100`} 
                subtext={`${Math.abs(scoreChange)} points ${scoreChange >= 0 ? 'improvement' : 'decrease'}`}
                icon={Brain} 
                color="border-blue-500"
              />
              <InsightCard 
                title="Goals Progress" 
                value={`${wellnessGoals.completed}/${wellnessGoals.total}`} 
                subtext={`${wellnessGoals.completed} goals achieved`}
                icon={Target} 
                color="border-green-500"
              />
              <InsightCard 
                title="AI Consultations" 
                value={recentInteractions.toString()} 
                subtext="Health discussions this month"
                icon={MessageSquare} 
                color="border-purple-500"
              />
            </div>

            {/* Health Metrics */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Health Metrics</h2>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  Real-time
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {healthMetrics.map((metric, index) => (
                  <HealthMetricCard key={index} {...metric} />
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">AI Health Insights</h2>
                  <p className="text-sm text-gray-500 mt-1">Personalized recommendations</p>
                </div>
              </div>
              <AIRecommendationsSection healthProfile={healthProfile} wellnessGoals={wellnessGoals} />
            </div>
          </div>

          {/* Right Column - Quick Actions and Activities */}
          <div className="space-y-6">
            <QuickActionsSection />
            <ScheduleSection />
          </div>
        </div>
      </div>

      {/* Call Waiting Dialog */}
      <CallWaitingDialog 
        isOpen={showCallDialog} 
        onClose={() => setShowCallDialog(false)} 
      />
    </div>
  );
};

export default Dashboard;
