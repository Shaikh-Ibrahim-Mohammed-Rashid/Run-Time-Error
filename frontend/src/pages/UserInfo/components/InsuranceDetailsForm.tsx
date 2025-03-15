import { useState } from 'react';
import { Shield, Info, Check } from 'lucide-react';
import { FormProps, Insurance } from '../types';
import { FormInput } from './FormInput';
import { NavigationButtons } from './NavigationButtons';

export const InsuranceDetailsForm = ({ data, updateData, nextStep, prevStep }: FormProps) => {
  const [isValid, setIsValid] = useState(false);

  const handleChange = (field: string, value: string) => {
    const newData = {
      ...data.medical_history.insurance_details,
      [field]: value
    };
    updateData('medical_history', {
      ...data.medical_history,
      insurance_details: newData
    });
    validateForm(newData);
  };

  const validateForm = (formData: Insurance) => {
    const required = ['provider', 'policy_number', 'coverage', 'valid_until'] as const;
    const isValid = required.every(field => formData[field as keyof Insurance] !== '');
    setIsValid(isValid);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Insurance Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Insurance Information</h3>
              <p className="text-gray-600 mt-1">
                Please provide your current insurance details for our records
              </p>
            </div>
          </div>
        </div>

        <FormInput
          label="Insurance Provider"
          value={data.medical_history.insurance_details.provider}
          onChange={(value) => handleChange('provider', value)}
          required
          info="Name of your health insurance company (e.g., Star Health, HDFC ERGO)"
        />
        <FormInput
          label="Policy Number"
          value={data.medical_history.insurance_details.policy_number}
          onChange={(value) => handleChange('policy_number', value)}
          required
          info="Your unique insurance policy number as shown on your insurance card"
        />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Coverage Type <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                Type of insurance coverage you have selected
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
              </div>
            </div>
          </div>
          <select
            value={data.medical_history.insurance_details.coverage}
            onChange={(e) => handleChange('coverage', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Coverage Type</option>
            <option value="Basic">Basic</option>
            <option value="Comprehensive">Comprehensive</option>
            <option value="Premium">Premium</option>
            <option value="Family Floater">Family Floater</option>
          </select>
        </div>
        <FormInput
          label="Valid Until"
          type="date"
          value={data.medical_history.insurance_details.valid_until}
          onChange={(value) => handleChange('valid_until', value)}
          required
          info="Expiry date of your insurance policy"
        />
      </div>

      {/* Coverage Details Display */}
      {data.medical_history.insurance_details.coverage && (
        <div className="mt-8 p-6 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Coverage Details</h3>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                Summary of services covered under your insurance plan
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Primary Care Visits</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Specialist Consultations</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Emergency Services</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Prescription Coverage</span>
            </div>
          </div>
        </div>
      )}

      <NavigationButtons onNext={nextStep} onPrev={prevStep} />
    </div>
  );
}; 