import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Info } from 'lucide-react';
import { FormProps, PersonalDetails } from '../types';
import { FormInput } from './FormInput';
import { NavigationButtons } from './NavigationButtons';

export const PersonalDetailsForm = ({ data, updateData, nextStep }: FormProps) => {
  const { user } = useUser();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Pre-fill data from Clerk
    updateData('personal_details', {
      ...data.personal_details,
      name: user?.fullName || '',
      email: user?.primaryEmailAddress?.emailAddress || '',
    });
  }, [user]);

  const handleChange = (field: string, value: string) => {
    const newData = {
      ...data.personal_details,
      [field]: value
    };
    updateData('personal_details', newData);
    validateForm(newData);
  };

  const handleAddressChange = (field: string, value: string) => {
    const newAddress = {
      ...data.personal_details.address,
      [field]: value
    };
    const newData = {
      ...data.personal_details,
      address: newAddress
    };
    updateData('personal_details', newData);
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    const newContact = {
      ...data.personal_details.emergency_contact,
      [field]: value
    };
    const newData = {
      ...data.personal_details,
      emergency_contact: newContact
    };
    updateData('personal_details', newData);
  };

  const validateForm = (formData: PersonalDetails) => {
    const required = ['name', 'email'] as const;
    const isMainValid = required.every(field => formData[field as keyof PersonalDetails]);
    setIsValid(isMainValid);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Details</h2>
      
      {/* Main Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <FormInput
          label="Full Name"
          value={data.personal_details.name}
          onChange={(value) => handleChange('name', value)}
          required
          info="Enter your legal full name as it appears on official documents"
        />
        <FormInput
          label="Age"
          type="number"
          value={data.personal_details.age}
          onChange={(value) => handleChange('age', value)}
          required
          info="Your current age in years"
        />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                Select your gender identity
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
              </div>
            </div>
          </div>
          <select
            value={data.personal_details.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <FormInput
          label="Date of Birth"
          type="date"
          value={data.personal_details.date_of_birth}
          onChange={(value) => handleChange('date_of_birth', value)}
          required
          info="Your date of birth in DD/MM/YYYY format"
        />
        <FormInput
          label="Blood Type"
          value={data.personal_details.blood_type}
          onChange={(value) => handleChange('blood_type', value)}
          info="Your blood type (e.g., A+, B-, O+, AB+)"
        />
        <FormInput
          label="Contact Number"
          value={data.personal_details.contact_number}
          onChange={(value) => handleChange('contact_number', value)}
          required
          info="Your primary contact number with country code (e.g., +91-XXXXXXXXXX)"
        />
        <FormInput
          label="Email"
          type="email"
          value={data.personal_details.email}
          onChange={(value) => handleChange('email', value)}
          required
          info="Your active email address for important medical communications"
        />
      </div>

      {/* Address Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Street"
            value={data.personal_details.address.street}
            onChange={(value) => handleAddressChange('street', value)}
            required
            info="Your street address including house/apartment number"
          />
          <FormInput
            label="City"
            value={data.personal_details.address.city}
            onChange={(value) => handleAddressChange('city', value)}
            required
            info="City or town of residence"
          />
          <FormInput
            label="State"
            value={data.personal_details.address.state}
            onChange={(value) => handleAddressChange('state', value)}
            required
            info="State or province of residence"
          />
          <FormInput
            label="ZIP Code"
            value={data.personal_details.address.zip_code}
            onChange={(value) => handleAddressChange('zip_code', value)}
            required
            info="Your area's postal/ZIP code"
          />
          <FormInput
            label="Country"
            value={data.personal_details.address.country}
            onChange={(value) => handleAddressChange('country', value)}
            required
            info="Country of residence"
          />
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Name"
            value={data.personal_details.emergency_contact.name}
            onChange={(value) => handleEmergencyContactChange('name', value)}
            required
            info="Full name of your emergency contact person"
          />
          <FormInput
            label="Relationship"
            value={data.personal_details.emergency_contact.relationship}
            onChange={(value) => handleEmergencyContactChange('relationship', value)}
            required
            info="Your relationship with the emergency contact (e.g., Spouse, Parent, Sibling)"
          />
          <FormInput
            label="Contact Number"
            value={data.personal_details.emergency_contact.contact_number}
            onChange={(value) => handleEmergencyContactChange('contact_number', value)}
            required
            info="Emergency contact's phone number with country code"
          />
        </div>
      </div>

      <NavigationButtons onNext={nextStep} />
    </div>
  );
}; 