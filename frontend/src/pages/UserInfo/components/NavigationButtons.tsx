import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { NavigationButtonsProps } from '../types';

export const NavigationButtons = ({ onPrev, onNext, onComplete, isLastStep = false }: NavigationButtonsProps) => (
  <div className="fixed bottom-0 right-0 p-4 sm:p-6 z-50 flex flex-row gap-3">
    <div className="absolute inset-0 backdrop-blur-sm bg-white/30" />
    
    {onPrev && (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onPrev}
        className="relative flex items-center justify-center gap-2 px-6 py-3 
          bg-white border-2 border-gray-200 text-gray-700 rounded-xl 
          hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900
          transition-all duration-200 shadow-lg hover:shadow-xl
          font-medium"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Previous</span>
      </motion.button>
    )}
    
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={isLastStep ? onComplete : onNext}
      className={`relative flex items-center justify-center gap-2 px-8 py-3 
        rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl
        font-medium
        ${isLastStep 
          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white' 
          : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'}`}
    >
      <span>{isLastStep ? 'Complete' : 'Next'}</span>
      <ChevronRight className="w-5 h-5" />
    </motion.button>
  </div>
); 