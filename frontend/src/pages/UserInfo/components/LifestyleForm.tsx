import { useState } from 'react';
import { Activity, Info } from 'lucide-react';
import { FormProps } from '../types';
import { FormInput } from './FormInput';
import { NavigationButtons } from './NavigationButtons';

export const LifestyleForm = ({ data, updateData, nextStep, prevStep }: FormProps) => {
  const [isValid, setIsValid] = useState(false);

  const handleChange = (field: string, value: string) => {
    const newData = {
      ...data.medical_history.lifestyle,
      [field]: value
    };
    updateData('medical_history', {
      ...data.medical_history,
      lifestyle: newData
    });
    validateForm(newData);
  };

  const validateForm = (formData: any) => {
    const required = ['smoking', 'alcohol_consumption', 'exercise_frequency', 'diet'];
    const isValid = required.every(field => formData[field] !== '');
    setIsValid(isValid);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Lifestyle Information</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-green-50 p-6 rounded-xl border border-green-100 mb-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Lifestyle Habits</h3>
              <p className="text-gray-600 mt-1">
                Please provide information about your lifestyle habits to help us better understand your health profile
              </p>
            </div>
          </div>
        </div>

        {/* Smoking Status */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Smoking Status <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                Your current smoking habits and history
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
              </div>
            </div>
          </div>
          <select
            value={data.medical_history.lifestyle.smoking}
            onChange={(e) => handleChange('smoking', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Smoking Status</option>
            <option value="Never Smoked">Never Smoked</option>
            <option value="Former Smoker">Former Smoker</option>
            <option value="Current Smoker">Current Smoker</option>
            <option value="Occasional Smoker">Occasional Smoker</option>
          </select>
        </div>

        {/* Alcohol Consumption */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Alcohol Consumption <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                Your alcohol consumption frequency and patterns
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
              </div>
            </div>
          </div>
          <select
            value={data.medical_history.lifestyle.alcohol_consumption}
            onChange={(e) => handleChange('alcohol_consumption', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Alcohol Consumption</option>
            <option value="Never">Never</option>
            <option value="Rarely">Rarely (Few times a year)</option>
            <option value="Occasionally">Occasionally (Few times a month)</option>
            <option value="Regularly">Regularly (Few times a week)</option>
            <option value="Daily">Daily</option>
          </select>
        </div>

        {/* Exercise Frequency */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Exercise Frequency <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                How often you engage in physical exercise or activities
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
              </div>
            </div>
          </div>
          <select
            value={data.medical_history.lifestyle.exercise_frequency}
            onChange={(e) => handleChange('exercise_frequency', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Exercise Frequency</option>
            <option value="Never">Never</option>
            <option value="Rarely">Rarely (Few times a month)</option>
            <option value="Occasionally">Occasionally (1-2 times a week)</option>
            <option value="Regularly">Regularly (3-4 times a week)</option>
            <option value="Daily">Daily</option>
          </select>
        </div>

        {/* Diet Description */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Diet Description <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                Describe your eating habits, dietary preferences, and any restrictions
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
              </div>
            </div>
          </div>
          <textarea
            value={data.medical_history.lifestyle.diet}
            onChange={(e) => handleChange('diet', e.target.value)}
            placeholder="Describe your diet (e.g., vegetarian, low-carb, gluten-free)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32 resize-none"
            required
          />
        </div>
      </div>

      <NavigationButtons onNext={nextStep} onPrev={prevStep} />
    </div>
  );
}; 