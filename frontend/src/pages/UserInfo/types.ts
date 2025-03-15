export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  contact_number: string;
}

export interface PersonalDetails {
  name: string;
  age: number;
  gender: string;
  date_of_birth: string;
  blood_type: string;
  contact_number: string;
  email: string;
  address: Address;
  emergency_contact: EmergencyContact;
}

export interface Allergy {
  allergen: string;
  reaction: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface Surgery {
  procedure: string;
  date: string;
  hospital: string;
}

export interface Vaccination {
  vaccine: string;
  date: string;
  dose: string;
}

export interface RecentVisit {
  date: string;
  doctor: string;
  reason: string;
  notes: string;
}

export interface FamilyCondition {
  condition: string;
  age_of_diagnosis: number;
}

export interface Lifestyle {
  smoking: string;
  alcohol_consumption: string;
  exercise_frequency: string;
  diet: string;
}

export interface Insurance {
  provider: string;
  policy_number: string;
  coverage: string;
  valid_until: string;
}

export interface MedicalHistory {
  chronic_conditions: string[];
  allergies: Allergy[];
  medications: Medication[];
  surgeries: Surgery[];
  vaccinations: Vaccination[];
  recent_visits: RecentVisit[];
  family_history: {
    father: FamilyCondition;
    mother: FamilyCondition;
  };
  lifestyle: Lifestyle;
  insurance_details: Insurance;
}

export interface HealthFormData {
  personal_details: PersonalDetails;
  medical_history: MedicalHistory;
}

export interface FormProps {
  data: HealthFormData;
  updateData: (section: string, data: any) => void;
  nextStep?: () => void;
  prevStep?: () => void;
  onComplete?: () => void;
}

export interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
  isStepValid: (step: number) => boolean;
  steps: Array<{
    icon: React.ElementType;
    label: string;
  }>;
}

export interface NavigationButtonsProps {
  onPrev?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  isLastStep?: boolean;
} 