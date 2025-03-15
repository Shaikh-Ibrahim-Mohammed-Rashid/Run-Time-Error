import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ProgressStepsProps } from '../types';

export const ProgressSteps = ({ currentStep, onStepClick, isStepValid, steps }: ProgressStepsProps) => {
  return (
    <div className="w-full py-2 sm:py-6 px-2 sm:px-8 bg-white rounded-2xl shadow-lg mb-4 sm:mb-8 overflow-x-auto">
      <div className="flex justify-between min-w-max sm:min-w-0">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = isStepValid(index);

          return (
            <button
              key={index}
              onClick={() => isClickable && onStepClick(index)}
              className={`flex flex-col items-center relative w-full min-w-[80px] sm:min-w-0 ${
                isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              }`}
              disabled={!isClickable}
            >
              {index < steps.length - 1 && (
                <div 
                  className={`absolute top-3 sm:top-5 w-full h-0.5 sm:h-1 left-[50%] 
                    ${isCompleted ? 'bg-blue-500' : 'bg-gray-200'}`}
                />
              )}
              
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted ? '#3B82F6' : isCurrent ? '#93C5FD' : '#E5E7EB',
                  scale: isCurrent ? 1.1 : 1
                }}
                className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center z-10 mb-1 sm:mb-2
                  ${isClickable ? 'hover:ring-2 hover:ring-blue-400' : ''}`}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3 sm:w-6 sm:h-6 text-white" />
                ) : (
                  <Icon className={`w-3 h-3 sm:w-6 sm:h-6 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                )}
              </motion.div>
              
              <span className={`text-[10px] sm:text-sm font-medium whitespace-nowrap px-1 ${
                isCurrent ? 'text-blue-600' : isClickable ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}; 