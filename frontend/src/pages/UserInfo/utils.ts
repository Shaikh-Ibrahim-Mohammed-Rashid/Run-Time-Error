import { HealthFormData } from './types';

export const STORAGE_KEY = 'health_profile_data';

export const saveToLocalStorage = (data: HealthFormData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadFromLocalStorage = (): HealthFormData | null => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
};

export const findFirstIncompleteStep = (data: HealthFormData): number => {
  // Check Personal Details
  if (!data.personal_details.name || !data.personal_details.email) {
    return 0;
  }

  // Check Medical History
  if (data.medical_history.chronic_conditions.length === 0 ||
      data.medical_history.allergies.length === 0 ||
      data.medical_history.medications.length === 0) {
    return 1;
  }

  // Check Insurance
  const insurance = data.medical_history.insurance_details;
  if (!insurance.provider || !insurance.policy_number || !insurance.coverage || !insurance.valid_until) {
    return 2;
  }

  // Check Lifestyle
  const lifestyle = data.medical_history.lifestyle;
  if (!lifestyle.smoking || !lifestyle.alcohol_consumption || 
      !lifestyle.exercise_frequency || !lifestyle.diet) {
    return 3;
  }

  // Check Family History
  const family = data.medical_history.family_history;
  if (!family.father.condition || !family.father.age_of_diagnosis ||
      !family.mother.condition || !family.mother.age_of_diagnosis) {
    return 4;
  }

  return 4; // If all complete, stay on last step
}; 