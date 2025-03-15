import { useState } from 'react';
import { Users, Info } from 'lucide-react';
import { FormProps } from '../types';
import { FormInput } from './FormInput';
import { NavigationButtons } from './NavigationButtons';

export const FamilyHistoryForm = ({ data, updateData, prevStep, onComplete }: FormProps) => {
  const [isValid, setIsValid] = useState(false);

  const handleChange = (parent: 'father' | 'mother', field: string, value: string | number) => {
    const newData = {
      ...data.medical_history.family_history,
      [parent]: {
        ...data.medical_history.family_history[parent],
        [field]: value
      }
    };
    updateData('medical_history', {
      ...data.medical_history,
      family_history: newData
    });
    validateForm(newData);
  };

  const validateForm = (formData: any) => {
    const isValid = 
      formData.father.condition !== '' && 
      formData.father.age_of_diagnosis > 0 &&
      formData.mother.condition !== '' && 
      formData.mother.age_of_diagnosis > 0;
    setIsValid(isValid);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Family Medical History</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 mb-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Family Health History</h3>
              <p className="text-gray-600 mt-1">
                Please provide information about any significant health conditions in your immediate family
              </p>
            </div>
          </div>
        </div>

        {/* Father's Medical History */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Father's Medical History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Medical Condition"
              value={data.medical_history.family_history.father.condition}
              onChange={(value) => handleChange('father', 'condition', value)}
              required
              info="Any significant health conditions your father has/had"
            />
            <FormInput
              label="Age of Diagnosis"
              type="number"
              value={data.medical_history.family_history.father.age_of_diagnosis.toString()}
              onChange={(value) => handleChange('father', 'age_of_diagnosis', parseInt(value) || 0)}
              required
              info="At what age was the condition diagnosed"
            />
          </div>
        </div>

        {/* Mother's Medical History */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mother's Medical History</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Medical Condition"
              value={data.medical_history.family_history.mother.condition}
              onChange={(value) => handleChange('mother', 'condition', value)}
              required
              info="Any significant health conditions your mother has/had"
            />
            <FormInput
              label="Age of Diagnosis"
              type="number"
              value={data.medical_history.family_history.mother.age_of_diagnosis.toString()}
              onChange={(value) => handleChange('mother', 'age_of_diagnosis', parseInt(value) || 0)}
              required
              info="At what age was the condition diagnosed"
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-blue-50 p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Important Note</h3>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                Why family history is important for your healthcare
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
              </div>
            </div>
          </div>
          <p className="text-gray-600">
            Family medical history is crucial for understanding your potential health risks. Many health conditions have a 
            genetic component, and knowing your family history helps healthcare providers:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 text-gray-600">
            <li>Assess your risk for certain conditions</li>
            <li>Recommend appropriate screening tests</li>
            <li>Provide personalized prevention strategies</li>
            <li>Make more informed decisions about your healthcare</li>
          </ul>
        </div>
      </div>

      <NavigationButtons onPrev={prevStep} onComplete={onComplete} isLastStep />
    </div>
  );
}; 