import { useState } from 'react';
import { Plus, Target, Check, Clock, XCircle, Sparkles, Trophy, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  category: 'fitness' | 'nutrition' | 'mental' | 'sleep' | 'other';
  createdAt: Date;
  targetDate?: Date;
}

const suggestionsByCategory = {
  fitness: [
    "Walk 10,000 steps daily",
    "Exercise 3 times a week",
    "Complete a 5K run",
    "Do 20 pushups daily",
    "Practice yoga for 15 minutes daily"
  ],
  nutrition: [
    "Drink 8 glasses of water daily",
    "Eat 5 servings of vegetables",
    "Reduce sugar intake",
    "Meal prep weekly",
    "Include protein in every meal"
  ],
  mental: [
    "Meditate for 10 minutes daily",
    "Practice gratitude journaling",
    "Read for 30 minutes daily",
    "Take regular breaks from screens",
    "Practice deep breathing exercises"
  ],
  sleep: [
    "Sleep 8 hours every night",
    "Maintain consistent sleep schedule",
    "No screens 1 hour before bed",
    "Create a bedtime routine",
    "Make bedroom sleep-friendly"
  ],
  other: [
    "Schedule regular health check-ups",
    "Take medications on time",
    "Monitor blood pressure weekly",
    "Practice good posture",
    "Stay up to date with vaccinations"
  ]
};

const Goals = () => {
  const { user } = useUser();
  const [goals, setGoals] = useState<Goal[]>(() => {
    const savedGoals = localStorage.getItem(`${user?.id}_goals`);
    return savedGoals ? JSON.parse(savedGoals) : [];
  });
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof suggestionsByCategory>('fitness');
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'fitness' as const,
  });

  const saveGoals = (updatedGoals: Goal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem(`${user?.id}_goals`, JSON.stringify(updatedGoals));
  };

  const addGoal = (goal: Partial<Goal>) => {
    const newGoalComplete: Goal = {
      id: Date.now().toString(),
      title: goal.title || '',
      description: goal.description || '',
      status: 'pending',
      category: goal.category || 'other',
      createdAt: new Date(),
    };
    saveGoals([...goals, newGoalComplete]);
    setIsAddingGoal(false);
    setNewGoal({ title: '', description: '', category: 'fitness' });
  };

  const updateGoalStatus = (goalId: string, status: Goal['status']) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, status } : goal
    );
    saveGoals(updatedGoals);
  };

  const deleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    saveGoals(updatedGoals);
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Health Goals
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Set, track, and achieve your wellness milestones
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddingGoal(true)}
              className="group px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 
                hover:to-indigo-700 text-white rounded-xl flex items-center space-x-2 shadow-lg 
                transition-all duration-200"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              <span>Create Goal</span>
            </motion.button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl">
              <div className="text-blue-600 dark:text-blue-400 text-2xl font-bold">
                {goals.filter(g => g.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl">
              <div className="text-yellow-600 dark:text-yellow-400 text-2xl font-bold">
                {goals.filter(g => g.status === 'in-progress').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl">
              <div className="text-purple-600 dark:text-purple-400 text-2xl font-bold">
                {goals.filter(g => g.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl">
              <div className="text-green-600 dark:text-green-400 text-2xl font-bold">
                {goals.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Goals</div>
            </div>
          </div>
        </div>

        {/* Goals Grid with Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <AnimatePresence>
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl 
                  transition-all duration-300 border border-gray-200 dark:border-gray-700
                  hover:border-blue-200 dark:hover:border-blue-800 relative overflow-hidden"
              >
                {/* Badges Row */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {/* Status Badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium 
                    ${goal.status === 'completed' 
                      ? 'bg-gradient-to-r from-green-500/10 to-green-600/10 text-green-600 dark:from-green-400/20 dark:to-green-500/20 dark:text-green-400 border border-green-500/20' 
                      : goal.status === 'in-progress' 
                      ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-600 dark:from-blue-400/20 dark:to-blue-500/20 dark:text-blue-400 border border-blue-500/20'
                      : 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 text-yellow-600 dark:from-yellow-400/20 dark:to-yellow-500/20 dark:text-yellow-400 border border-yellow-500/20'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      goal.status === 'completed' ? 'bg-green-500 dark:bg-green-400' :
                      goal.status === 'in-progress' ? 'bg-blue-500 dark:bg-blue-400' :
                      'bg-yellow-500 dark:bg-yellow-400'
                    } animate-pulse`} />
                    <span className="capitalize">
                      {goal.status.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium 
                    ${goal.category === 'fitness' 
                      ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-600 dark:from-blue-400/20 dark:to-blue-500/20 dark:text-blue-400 border border-blue-500/20' 
                      : goal.category === 'nutrition'
                      ? 'bg-gradient-to-r from-green-500/10 to-green-600/10 text-green-600 dark:from-green-400/20 dark:to-green-500/20 dark:text-green-400 border border-green-500/20'
                      : goal.category === 'mental'
                      ? 'bg-gradient-to-r from-purple-500/10 to-purple-600/10 text-purple-600 dark:from-purple-400/20 dark:to-purple-500/20 dark:text-purple-400 border border-purple-500/20'
                      : goal.category === 'sleep'
                      ? 'bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 text-indigo-600 dark:from-indigo-400/20 dark:to-indigo-500/20 dark:text-indigo-400 border border-indigo-500/20'
                      : 'bg-gradient-to-r from-gray-500/10 to-gray-600/10 text-gray-600 dark:from-gray-400/20 dark:to-gray-500/20 dark:text-gray-400 border border-gray-500/20'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      goal.category === 'fitness' ? 'bg-blue-500 dark:bg-blue-400' :
                      goal.category === 'nutrition' ? 'bg-green-500 dark:bg-green-400' :
                      goal.category === 'mental' ? 'bg-purple-500 dark:bg-purple-400' :
                      goal.category === 'sleep' ? 'bg-indigo-500 dark:bg-indigo-400' :
                      'bg-gray-500 dark:bg-gray-400'
                    }`} />
                    <span className="capitalize">
                      {goal.category}
                    </span>
                  </div>
                </div>

                {/* Category Icon and Title */}
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${
                    goal.category === 'fitness' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                    goal.category === 'nutrition' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                    goal.category === 'mental' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                    goal.category === 'sleep' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                  } transform group-hover:scale-110 transition-transform duration-200`}>
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {goal.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                      {goal.description}
                    </p>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {/* Action Buttons */}
                  <div className="flex -space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateGoalStatus(goal.id, 'completed')}
                      className="relative p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 
                        rounded-xl transition-colors z-10 hover:z-20"
                      title="Mark as completed"
                    >
                      <Check className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateGoalStatus(goal.id, 'in-progress')}
                      className="relative p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 
                        rounded-xl transition-colors z-10 hover:z-20"
                      title="Mark as in progress"
                    >
                      <Clock className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteGoal(goal.id)}
                      className="relative p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 
                        rounded-xl transition-colors z-10 hover:z-20"
                      title="Delete goal"
                    >
                      <XCircle className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Date */}
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 
                    dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {new Date(goal.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Enhanced Add Goal Modal */}
        <AnimatePresence>
          {isAddingGoal && (
            <>
              {/* Full screen backdrop with blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center"
                onClick={() => setIsAddingGoal(false)}
              >
                {/* Modal Content */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto
                    bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 
                    rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r 
                        from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        Create New Goal
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Define your next health milestone
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsAddingGoal(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Category & Title */}
                    <div className="space-y-5">
                      {/* Category Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Category
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.keys(suggestionsByCategory).map((category) => (
                            <motion.button
                              key={category}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setSelectedCategory(category as keyof typeof suggestionsByCategory);
                                setNewGoal(prev => ({ ...prev, category: category as Goal['category'] }));
                              }}
                              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                flex items-center justify-center gap-2
                                ${selectedCategory === category 
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                              <Target className="w-4 h-4" />
                              <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Goal Title & Description */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Goal Title
                          </label>
                          <input
                            type="text"
                            value={newGoal.title}
                            onChange={e => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 
                              dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                              focus:border-transparent transition-all duration-200 shadow-sm"
                            placeholder="Enter your goal"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            value={newGoal.description}
                            onChange={e => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 
                              dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                              focus:border-transparent transition-all duration-200 shadow-sm"
                            placeholder="Add some details about your goal"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Suggestions */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Suggested Goals
                        </h3>
                      </div>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin 
                        scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 pr-2">
                        {suggestionsByCategory[selectedCategory].map((suggestion, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.01, x: 4 }}
                            onClick={() => setNewGoal(prev => ({ ...prev, title: suggestion }))}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 
                              flex items-center gap-3 ${
                            newGoal.title === suggestion
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          >
                            {newGoal.title === suggestion ? (
                              <Check className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Target className="w-4 h-4 text-gray-400" />
                            )}
                            <span>{suggestion}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsAddingGoal(false)}
                      className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 
                        dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addGoal(newGoal)}
                      disabled={!newGoal.title}
                      className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 
                        hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl 
                        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                        shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create Goal</span>
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Goals; 