import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Calendar, Plus, Activity, Apple, Moon, Sun, Coffee, 
  Utensils, Brain, Heart, Dumbbell, Pill, Stethoscope 
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface TimelineItem {
  time: string;
  activity: string;
  icon: JSX.Element;
  category: 'medication' | 'exercise' | 'meal' | 'checkup' | 'rest';
}

const suggestedInputs = [
  "I have type 2 diabetes and work from 9-5. I need help managing my medication and meals.",
  "I'm recovering from heart surgery and need a gentle exercise routine with my medications.",
  "I have hypertension and need to balance my work schedule with regular BP monitoring.",
  "I'm pre-diabetic and want to prevent progression with lifestyle changes.",
  "I need a plan that includes regular asthma medication and moderate exercise."
];

const getIconForActivity = (activity: string) => {
  if (activity.toLowerCase().includes('medication') || activity.toLowerCase().includes('insulin')) 
    return <Pill className="w-5 h-5" />;
  if (activity.toLowerCase().includes('exercise') || activity.toLowerCase().includes('walk')) 
    return <Dumbbell className="w-5 h-5" />;
  if (activity.toLowerCase().includes('breakfast') || activity.toLowerCase().includes('lunch') || 
      activity.toLowerCase().includes('dinner') || activity.toLowerCase().includes('snack')) 
    return <Utensils className="w-5 h-5" />;
  if (activity.toLowerCase().includes('check') || activity.toLowerCase().includes('monitor')) 
    return <Stethoscope className="w-5 h-5" />;
  if (activity.toLowerCase().includes('sleep')) 
    return <Moon className="w-5 h-5" />;
  return <Activity className="w-5 h-5" />;
};

const HealthPlan = () => {
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [schedule, setSchedule] = useState<TimelineItem[]>([]);
  const [showSchedule, setShowSchedule] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medication':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700';
      case 'exercise':
        return 'bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700';
      case 'meal':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700';
      case 'checkup':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700';
      case 'rest':
        return 'bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700';
    }
  };

  const handleGeneratePlan = async () => {
    try {
      setIsGenerating(true);
      setShowSchedule(false);

      const response = await axios.post('https://2bqox2omzsf8.share.zrok.io/api/php', {
        user_summary: userInput
      });

      const healthPlan = response.data.health_plan;
      
      // Convert API response to TimelineItem array
      const newSchedule: TimelineItem[] = Object.entries(healthPlan).map(([time, activity]) => {
        const activityStr = activity as string;
        let category: TimelineItem['category'] = 'checkup';

        if (activityStr.toLowerCase().includes('medication') || activityStr.toLowerCase().includes('insulin'))
          category = 'medication';
        else if (activityStr.toLowerCase().includes('exercise') || activityStr.toLowerCase().includes('walk'))
          category = 'exercise';
        else if (activityStr.toLowerCase().includes('breakfast') || activityStr.toLowerCase().includes('lunch') || 
                 activityStr.toLowerCase().includes('dinner') || activityStr.toLowerCase().includes('snack'))
          category = 'meal';
        else if (activityStr.toLowerCase().includes('sleep'))
          category = 'rest';

        return {
          time,
          activity: activityStr,
          icon: getIconForActivity(activityStr),
          category
        };
      });

      // Sort by time
      newSchedule.sort((a, b) => {
        const timeA = parseInt(a.time.split(':')[0]);
        const timeB = parseInt(b.time.split(':')[0]);
        return timeA - timeB;
      });

      setSchedule(newSchedule);
      setShowSchedule(true);
      toast.success('Health plan generated successfully!');
    } catch (error) {
      console.error('Error generating health plan:', error);
      toast.error('Failed to generate health plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Health Planner
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Get a personalized daily schedule based on your health profile
              </p>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-6">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Describe your health conditions, medications, and daily routine..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                resize-none h-32"
            />

            {/* Suggested Inputs */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Suggested Profiles:
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestedInputs.map((input, index) => (
                  <button
                    key={index}
                    onClick={() => setUserInput(input)}
                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 
                      dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 
                      transition-colors duration-200"
                  >
                    {input.slice(0, 50)}...
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating || !userInput.trim()}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 
                hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl 
                disabled:opacity-50 disabled:cursor-not-allowed transition-all
                flex items-center justify-center gap-2 font-medium"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Generating Your Plan...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Generate Personalized Plan
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Timeline */}
        <AnimatePresence>
          {showSchedule && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="space-y-6">
                {schedule.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 relative"
                  >
                    {/* Vertical Timeline Line */}
                    {index < schedule.length - 1 && (
                      <div className="absolute left-8 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                    )}

                    {/* Time */}
                    <div className="flex-shrink-0 w-16 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {item.time}
                    </div>

                    {/* Activity Card */}
                    <div className="flex-1">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 
                        border border-gray-200 dark:border-gray-700 relative overflow-hidden group
                        hover:shadow-md transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl ${getCategoryColor(item.category)} 
                            text-white transform group-hover:scale-110 transition-transform duration-200
                            shadow-lg`}>
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 dark:text-white font-medium">
                              {item.activity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HealthPlan; 