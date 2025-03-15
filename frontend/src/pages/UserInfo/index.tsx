import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Heart, Shield, Activity, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';

import { HealthFormData } from './types';
import { loadFromLocalStorage, saveToLocalStorage, findFirstIncompleteStep } from './utils';
import { demoProfiles } from './demoData';
import { ProgressSteps } from './components/ProgressSteps';
import { PersonalDetailsForm } from './components/PersonalDetailsForm';
import { MedicalHistoryForm } from './components/MedicalHistoryForm';
import { InsuranceDetailsForm } from './components/InsuranceDetailsForm';
import { LifestyleForm } from './components/LifestyleForm';
import { FamilyHistoryForm } from './components/FamilyHistoryForm';

const UserInfo = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState<HealthFormData>(() => {
    return loadFromLocalStorage() || {
      personal_details: {
        name: '',
        age: 0,
        gender: '',
        date_of_birth: '',
        blood_type: '',
        contact_number: '',
        email: '',
        address: {
          street: '',
          city: '',
          state: '',
          zip_code: '',
          country: ''
        },
        emergency_contact: {
          name: '',
          relationship: '',
          contact_number: ''
        }
      },
      medical_history: {
        chronic_conditions: [],
        allergies: [],
        medications: [],
        surgeries: [],
        vaccinations: [],
        recent_visits: [],
        family_history: {
          father: { condition: '', age_of_diagnosis: 0 },
          mother: { condition: '', age_of_diagnosis: 0 }
        },
        lifestyle: {
          smoking: '',
          alcohol_consumption: '',
          exercise_frequency: '',
          diet: ''
        },
        insurance_details: {
          provider: '',
          policy_number: '',
          coverage: '',
          valid_until: ''
        }
      }
    };
  });

  const [currentStep, setCurrentStep] = useState(() => {
    const savedData = loadFromLocalStorage();
    return savedData ? findFirstIncompleteStep(savedData) : 0;
  });

  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  const updateData = (section: string, data: any) => {
    const newFormData = {
      ...formData,
      [section]: data
    };
    setFormData(newFormData);
    saveToLocalStorage(newFormData);
  };

  const loadDemoData = () => {
    const randomIndex = Math.floor(Math.random() * demoProfiles.length);
    const selectedProfile = demoProfiles[randomIndex];
    setFormData(selectedProfile);
    saveToLocalStorage(selectedProfile);
    // Force immediate validation of all steps
    for (let step = 0; step <= 4; step++) {
      if (isStepValid(step)) {
        setIsValid(true);
      }
    }
  };

  const validateCurrentStep = (data: HealthFormData) => {
    switch(currentStep) {
      case 0:
        setIsValid(data.personal_details.name !== '' && data.personal_details.email !== '');
        break;
      case 1:
        setIsValid(data.medical_history.chronic_conditions.length > 0 &&
            data.medical_history.allergies.length > 0 &&
            data.medical_history.medications.length > 0);
        break;
      case 2:
        setIsValid(data.medical_history.insurance_details.provider !== '' &&
            data.medical_history.insurance_details.policy_number !== '' &&
            data.medical_history.insurance_details.coverage !== '' &&
            data.medical_history.insurance_details.valid_until !== '');
        break;
      case 3:
        setIsValid(data.medical_history.lifestyle.smoking !== '' &&
            data.medical_history.lifestyle.alcohol_consumption !== '' &&
            data.medical_history.lifestyle.exercise_frequency !== '' &&
            data.medical_history.lifestyle.diet !== '');
        break;
      case 4:
        setIsValid(data.medical_history.family_history.father.condition !== '' &&
            data.medical_history.family_history.father.age_of_diagnosis > 0 &&
            data.medical_history.family_history.mother.condition !== '' &&
            data.medical_history.family_history.mother.age_of_diagnosis > 0);
        break;
    }
  };

  useEffect(() => {
    validateCurrentStep(formData);
  }, [formData, currentStep]);

  const isStepValid = (step: number) => {
    switch(step) {
      case 0:
        return formData.personal_details.name !== '' && formData.personal_details.email !== '';
      case 1:
        return formData.medical_history.chronic_conditions.length > 0 &&
               formData.medical_history.allergies.length > 0 &&
               formData.medical_history.medications.length > 0;
      case 2:
        return formData.medical_history.insurance_details.provider !== '' &&
               formData.medical_history.insurance_details.policy_number !== '' &&
               formData.medical_history.insurance_details.coverage !== '' &&
               formData.medical_history.insurance_details.valid_until !== '';
      case 3:
        return formData.medical_history.lifestyle.smoking !== '' &&
               formData.medical_history.lifestyle.alcohol_consumption !== '' &&
               formData.medical_history.lifestyle.exercise_frequency !== '' &&
               formData.medical_history.lifestyle.diet !== '';
      case 4:
        return formData.medical_history.family_history.father.condition !== '' &&
               formData.medical_history.family_history.father.age_of_diagnosis > 0 &&
               formData.medical_history.family_history.mother.condition !== '' &&
               formData.medical_history.family_history.mother.age_of_diagnosis > 0;
      default:
        return false;
    }
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    try {
      if (!user?.id) {
        throw new Error('User ID not found');
      }

      // Create FormData instance
      const apiFormData = new FormData();
      apiFormData.append('id', user.id);
      apiFormData.append('data', JSON.stringify(formData));

      // Make API call to save data
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/save_data`, {
        method: 'POST',
        body: apiFormData,
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      const result = await response.json();
      
      if (result.message === "Data saved successfully") {
        // Save to localStorage
        saveToLocalStorage(formData);

        // Add blur class to the main container
        document.body.style.overflow = 'hidden';
        document.querySelector('.min-h-screen')?.classList.add('blur-sm', 'transition-all', 'duration-300');

        // Show success message with animation
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 rounded-xl shadow-2xl z-50 text-center animate-fade-in bg-white/90 backdrop-blur-md';
        successMessage.innerHTML = `
          <div class="mb-4">
            <svg class="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-green-600 mb-4">Profile Completed!</h2>
          <p class="text-gray-600">Your health profile has been saved successfully.</p>
        `;
        document.body.appendChild(successMessage);

        // Add fade-in animation style
        const style = document.createElement('style');
        style.textContent = `
          @keyframes fade-in {
            from { opacity: 0; transform: translate(-50%, -40%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `;
        document.head.appendChild(style);

        // Redirect after animation and cleanup
        setTimeout(() => {
          // Remove blur and restore scroll before redirecting
          document.querySelector('.min-h-screen')?.classList.remove('blur-sm');
          document.body.style.overflow = '';
          successMessage.remove();
          style.remove();
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to save data');
      }
    } catch (error) {
      console.error('Error saving health profile:', error);
      
      // Add blur class to the main container for error state
      document.body.style.overflow = 'hidden';
      document.querySelector('.min-h-screen')?.classList.add('blur-sm', 'transition-all', 'duration-300');
      
      // Show error message with animation
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 rounded-xl shadow-2xl z-50 text-center animate-fade-in bg-white/90 backdrop-blur-md';
      errorMessage.innerHTML = `
        <div class="mb-4">
          <svg class="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p class="text-gray-600">Failed to save your health profile. Please try again.</p>
      `;
      document.body.appendChild(errorMessage);

      // Remove error message, blur and restore scroll after 3 seconds
      setTimeout(() => {
        document.querySelector('.min-h-screen')?.classList.remove('blur-sm');
        document.body.style.overflow = '';
        errorMessage.remove();
      }, 3000);
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 0:
        return <PersonalDetailsForm data={formData} updateData={updateData} nextStep={nextStep} />;
      case 1:
        return <MedicalHistoryForm data={formData} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
      case 2:
        return <InsuranceDetailsForm data={formData} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return <LifestyleForm data={formData} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />;
      case 4:
        return <FamilyHistoryForm data={formData} updateData={updateData} prevStep={prevStep} onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-4">
      <div className="mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Complete Your Health Profile</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Help us provide you with better care by sharing your health information
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadDemoData}
              className="w-full sm:w-auto px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 
                transition-colors flex items-center justify-center space-x-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>Load Demo Data</span>
            </motion.button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="overflow-x-auto pb-2 sm:pb-0 -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="min-w-max sm:min-w-0">
            <ProgressSteps 
              currentStep={currentStep} 
              totalSteps={5} 
              onStepClick={handleStepClick} 
              isStepValid={isStepValid}
              steps={[
                { icon: User, label: 'Personal Details' },
                { icon: Heart, label: 'Medical History' },
                { icon: Shield, label: 'Insurance' },
                { icon: Activity, label: 'Lifestyle' },
                { icon: Users, label: 'Family History' }
              ]}
            />
          </div>
        </div>
        
        {/* Form Sections */}
        <div className="mt-6 sm:mt-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default UserInfo; 