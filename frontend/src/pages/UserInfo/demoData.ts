import { FormData } from './types';

export const demoProfiles: FormData[] = [
  {
    personal_details: {
      name: "Rajesh Kumar",
      age: 32,
      gender: "Male",
      date_of_birth: "1992-05-15",
      blood_type: "B+",
      contact_number: "+91-9876543210",
      email: "rajesh.kumar@example.com",
      address: {
        street: "123 Sector 15",
        city: "New Delhi",
        state: "Delhi",
        zip_code: "110015",
        country: "India"
      },
      emergency_contact: {
        name: "Priya Kumar",
        relationship: "Wife",
        contact_number: "+91-9876543211"
      }
    },
    medical_history: {
      chronic_conditions: ["Diabetes Type 2", "Hypertension"],
      allergies: [
        { allergen: "Dairy", reaction: "Lactose Intolerance" },
        { allergen: "Amoxicillin", reaction: "Skin Rash" }
      ],
      medications: [
        { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
        { name: "Telmisartan", dosage: "40mg", frequency: "Once daily" }
      ],
      surgeries: [
        { procedure: "Appendectomy", date: "2018-06-20", hospital: "Apollo Hospital, Delhi" }
      ],
      vaccinations: [
        { vaccine: "COVID-19 (Covishield)", date: "2021-03-15", dose: "2nd dose" },
        { vaccine: "Hepatitis B", date: "2019-08-10", dose: "Complete" }
      ],
      recent_visits: [
        {
          date: "2024-01-10",
          doctor: "Dr. Sharma",
          reason: "Diabetes Follow-up",
          notes: "Blood sugar levels stable"
        }
      ],
      family_history: {
        father: {
          condition: "Heart Disease",
          age_of_diagnosis: 52
        },
        mother: {
          condition: "Diabetes Type 2",
          age_of_diagnosis: 48
        }
      },
      lifestyle: {
        smoking: "Never",
        alcohol_consumption: "Never",
        exercise_frequency: "3-4 times a week",
        diet: "Vegetarian diet with low glycemic index foods"
      },
      insurance_details: {
        provider: "Star Health Insurance",
        policy_number: "STAR123456789",
        coverage: "Family Floater",
        valid_until: "2025-12-31"
      }
    }
  },
  {
    personal_details: {
      name: "Priya Patel",
      age: 28,
      gender: "Female",
      date_of_birth: "1996-07-22",
      blood_type: "A+",
      contact_number: "+91-8765432109",
      email: "priya.patel@example.com",
      address: {
        street: "45 Satellite Road",
        city: "Ahmedabad",
        state: "Gujarat",
        zip_code: "380015",
        country: "India"
      },
      emergency_contact: {
        name: "Amit Patel",
        relationship: "Brother",
        contact_number: "+91-8765432108"
      }
    },
    medical_history: {
      chronic_conditions: ["Asthma", "Thyroid"],
      allergies: [
        { allergen: "Dust", reaction: "Respiratory distress" },
        { allergen: "Peanuts", reaction: "Severe allergic reaction" }
      ],
      medications: [
        { name: "Levothyroxine", dosage: "25mcg", frequency: "Once daily" },
        { name: "Salbutamol", dosage: "100mcg", frequency: "As needed" }
      ],
      surgeries: [
        { procedure: "Tonsillectomy", date: "2015-03-15", hospital: "Sterling Hospital, Ahmedabad" }
      ],
      vaccinations: [
        { vaccine: "COVID-19 (Covaxin)", date: "2021-04-20", dose: "2nd dose" },
        { vaccine: "Flu Shot", date: "2023-10-15", dose: "Annual" }
      ],
      recent_visits: [
        {
          date: "2024-02-05",
          doctor: "Dr. Mehta",
          reason: "Thyroid Check",
          notes: "TSH levels normalized"
        }
      ],
      family_history: {
        father: {
          condition: "Asthma",
          age_of_diagnosis: 35
        },
        mother: {
          condition: "Hypothyroidism",
          age_of_diagnosis: 42
        }
      },
      lifestyle: {
        smoking: "Never",
        alcohol_consumption: "Never",
        exercise_frequency: "5+ times a week",
        diet: "Vegetarian with focus on protein-rich foods"
      },
      insurance_details: {
        provider: "HDFC ERGO Health",
        policy_number: "HDFC987654321",
        coverage: "Premium",
        valid_until: "2024-12-31"
      }
    }
  },
  {
    personal_details: {
      name: "Arjun Reddy",
      age: 45,
      gender: "Male",
      date_of_birth: "1979-11-30",
      blood_type: "O+",
      contact_number: "+91-7654321098",
      email: "arjun.reddy@example.com",
      address: {
        street: "789 Jubilee Hills",
        city: "Hyderabad",
        state: "Telangana",
        zip_code: "500033",
        country: "India"
      },
      emergency_contact: {
        name: "Meera Reddy",
        relationship: "Spouse",
        contact_number: "+91-7654321097"
      }
    },
    medical_history: {
      chronic_conditions: ["High Cholesterol", "GERD"],
      allergies: [
        { allergen: "Shellfish", reaction: "Severe allergic reaction" },
        { allergen: "Aspirin", reaction: "Stomach irritation" }
      ],
      medications: [
        { name: "Rosuvastatin", dosage: "10mg", frequency: "Once daily" },
        { name: "Pantoprazole", dosage: "40mg", frequency: "Once daily" }
      ],
      surgeries: [
        { procedure: "Knee Arthroscopy", date: "2019-09-12", hospital: "Care Hospital, Hyderabad" }
      ],
      vaccinations: [
        { vaccine: "COVID-19 (Covishield)", date: "2021-05-10", dose: "Booster" },
        { vaccine: "Pneumococcal", date: "2022-11-20", dose: "Complete" }
      ],
      recent_visits: [
        {
          date: "2024-01-20",
          doctor: "Dr. Rao",
          reason: "Annual Physical",
          notes: "Cholesterol levels need monitoring"
        }
      ],
      family_history: {
        father: {
          condition: "Type 2 Diabetes",
          age_of_diagnosis: 58
        },
        mother: {
          condition: "Osteoporosis",
          age_of_diagnosis: 62
        }
      },
      lifestyle: {
        smoking: "Former",
        alcohol_consumption: "Occasionally",
        exercise_frequency: "2-3 times a week",
        diet: "Non-vegetarian, following low-fat diet"
      },
      insurance_details: {
        provider: "Max Bupa Health Insurance",
        policy_number: "MAX456789012",
        coverage: "Comprehensive",
        valid_until: "2025-06-30"
      }
    }
  }
]; 