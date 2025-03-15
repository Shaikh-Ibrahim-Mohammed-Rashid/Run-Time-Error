import { useState } from 'react';
import { Info } from 'lucide-react';
import { FormProps, Allergy, Medication, Surgery, Vaccination, RecentVisit } from '../types';
import { FormInput } from './FormInput';
import { NavigationButtons } from './NavigationButtons';
import { RemoveButton } from './RemoveButton';

export const MedicalHistoryForm = ({ data, updateData, nextStep, prevStep }: FormProps) => {
  // Dynamic list management
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState({ allergen: '', reaction: '' });
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '' });
  const [newSurgery, setNewSurgery] = useState({ procedure: '', date: '', hospital: '' });
  const [newVaccination, setNewVaccination] = useState({ vaccine: '', date: '', dose: '' });
  const [newVisit, setNewVisit] = useState({ date: '', doctor: '', reason: '', notes: '' });

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      updateData('medical_history', {
        ...data.medical_history,
        chronic_conditions: [...data.medical_history.chronic_conditions, newCondition]
      });
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (index: number) => {
    const newConditions = data.medical_history.chronic_conditions.filter((_: any, i: number) => i !== index);
    updateData('medical_history', {
      ...data.medical_history,
      chronic_conditions: newConditions
    });
  };

  const handleAddAllergy = () => {
    if (newAllergy.allergen && newAllergy.reaction) {
      updateData('medical_history', {
        ...data.medical_history,
        allergies: [...data.medical_history.allergies, newAllergy]
      });
      setNewAllergy({ allergen: '', reaction: '' });
    }
  };

  const handleAddMedication = () => {
    if (newMedication.name && newMedication.dosage && newMedication.frequency) {
      updateData('medical_history', {
        ...data.medical_history,
        medications: [...data.medical_history.medications, newMedication]
      });
      setNewMedication({ name: '', dosage: '', frequency: '' });
    }
  };

  const handleAddSurgery = () => {
    if (newSurgery.procedure && newSurgery.date && newSurgery.hospital) {
      updateData('medical_history', {
        ...data.medical_history,
        surgeries: [...data.medical_history.surgeries, newSurgery]
      });
      setNewSurgery({ procedure: '', date: '', hospital: '' });
    }
  };

  const handleAddVaccination = () => {
    if (newVaccination.vaccine && newVaccination.date && newVaccination.dose) {
      updateData('medical_history', {
        ...data.medical_history,
        vaccinations: [...data.medical_history.vaccinations, newVaccination]
      });
      setNewVaccination({ vaccine: '', date: '', dose: '' });
    }
  };

  const handleAddVisit = () => {
    if (newVisit.date && newVisit.doctor && newVisit.reason) {
      updateData('medical_history', {
        ...data.medical_history,
        recent_visits: [...data.medical_history.recent_visits, newVisit]
      });
      setNewVisit({ date: '', doctor: '', reason: '', notes: '' });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Medical History</h2>

      {/* Chronic Conditions Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Chronic Conditions</h3>
          <div className="relative group">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
              List any long-term medical conditions you have been diagnosed with
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              placeholder="Enter condition (e.g., Diabetes, Hypertension)"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddCondition}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.medical_history.chronic_conditions.map((condition: string, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>{condition}</span>
                <RemoveButton onClick={() => handleRemoveCondition(index)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Allergies Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Allergies</h3>
          <div className="relative group">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
              List any allergies and their reactions
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Allergen"
              value={newAllergy.allergen}
              onChange={(value) => setNewAllergy({ ...newAllergy, allergen: value })}
              info="Specify what you are allergic to"
            />
            <FormInput
              label="Reaction"
              value={newAllergy.reaction}
              onChange={(value) => setNewAllergy({ ...newAllergy, reaction: value })}
              info="Describe how your body reacts to this allergen"
            />
          </div>
          <button
            onClick={handleAddAllergy}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Allergy
          </button>
          <div className="grid grid-cols-1 gap-4">
            {data.medical_history.allergies.map((allergy: Allergy, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{allergy.allergen}</p>
                  <p className="text-sm text-gray-600">Reaction: {allergy.reaction}</p>
                </div>
                <RemoveButton 
                  onClick={() => {
                    const newAllergies = data.medical_history.allergies.filter((_: any, i: number) => i !== index);
                    updateData('medical_history', {
                      ...data.medical_history,
                      allergies: newAllergies
                    });
                  }} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Medications Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Current Medications</h3>
          <div className="relative group">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
              List all medications you are currently taking
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Medication Name"
              value={newMedication.name}
              onChange={(value) => setNewMedication({ ...newMedication, name: value })}
              info="Enter the name of the medication"
            />
            <FormInput
              label="Dosage"
              value={newMedication.dosage}
              onChange={(value) => setNewMedication({ ...newMedication, dosage: value })}
              info="Specify the strength/amount of medication"
            />
            <FormInput
              label="Frequency"
              value={newMedication.frequency}
              onChange={(value) => setNewMedication({ ...newMedication, frequency: value })}
              info="How often you take this medication"
            />
          </div>
          <button
            onClick={handleAddMedication}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Medication
          </button>
          <div className="grid grid-cols-1 gap-4">
            {data.medical_history.medications.map((medication: Medication, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{medication.name}</p>
                  <p className="text-sm text-gray-600">
                    {medication.dosage} - {medication.frequency}
                  </p>
                </div>
                <RemoveButton 
                  onClick={() => {
                    const newMedications = data.medical_history.medications.filter((_: any, i: number) => i !== index);
                    updateData('medical_history', {
                      ...data.medical_history,
                      medications: newMedications
                    });
                  }} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Surgeries Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Past Surgeries</h3>
          <div className="relative group">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
              List any surgical procedures you have undergone
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Procedure"
              value={newSurgery.procedure}
              onChange={(value) => setNewSurgery({ ...newSurgery, procedure: value })}
              info="Name of the surgical procedure"
            />
            <FormInput
              label="Date"
              type="date"
              value={newSurgery.date}
              onChange={(value) => setNewSurgery({ ...newSurgery, date: value })}
              info="Date when the surgery was performed"
            />
            <FormInput
              label="Hospital"
              value={newSurgery.hospital}
              onChange={(value) => setNewSurgery({ ...newSurgery, hospital: value })}
              info="Name of the hospital where surgery was performed"
            />
          </div>
          <button
            onClick={handleAddSurgery}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Surgery
          </button>
          <div className="grid grid-cols-1 gap-4">
            {data.medical_history.surgeries.map((surgery: Surgery, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{surgery.procedure}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(surgery.date).toLocaleDateString()} - {surgery.hospital}
                  </p>
                </div>
                <RemoveButton 
                  onClick={() => {
                    const newSurgeries = data.medical_history.surgeries.filter((_: any, i: number) => i !== index);
                    updateData('medical_history', {
                      ...data.medical_history,
                      surgeries: newSurgeries
                    });
                  }} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vaccinations Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Vaccinations</h3>
          <div className="relative group">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
              List your vaccination history
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Vaccine"
              value={newVaccination.vaccine}
              onChange={(value) => setNewVaccination({ ...newVaccination, vaccine: value })}
              info="Name of the vaccine"
            />
            <FormInput
              label="Date"
              type="date"
              value={newVaccination.date}
              onChange={(value) => setNewVaccination({ ...newVaccination, date: value })}
              info="Date when the vaccine was administered"
            />
            <FormInput
              label="Dose"
              value={newVaccination.dose}
              onChange={(value) => setNewVaccination({ ...newVaccination, dose: value })}
              info="Which dose in the vaccination series"
            />
          </div>
          <button
            onClick={handleAddVaccination}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Vaccination
          </button>
          <div className="grid grid-cols-1 gap-4">
            {data.medical_history.vaccinations.map((vaccination: Vaccination, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{vaccination.vaccine}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(vaccination.date).toLocaleDateString()} - {vaccination.dose}
                  </p>
                </div>
                <RemoveButton 
                  onClick={() => {
                    const newVaccinations = data.medical_history.vaccinations.filter((_: any, i: number) => i !== index);
                    updateData('medical_history', {
                      ...data.medical_history,
                      vaccinations: newVaccinations
                    });
                  }} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Visits Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Recent Medical Visits</h3>
          <div className="relative group">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
              Record your recent doctor visits and consultations
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Date"
              type="date"
              value={newVisit.date}
              onChange={(value) => setNewVisit({ ...newVisit, date: value })}
              info="Date of the medical visit"
            />
            <FormInput
              label="Doctor"
              value={newVisit.doctor}
              onChange={(value) => setNewVisit({ ...newVisit, doctor: value })}
              info="Name of the doctor you consulted"
            />
            <FormInput
              label="Reason"
              value={newVisit.reason}
              onChange={(value) => setNewVisit({ ...newVisit, reason: value })}
              info="Purpose of the visit"
            />
            <div className="relative">
              <textarea
                value={newVisit.notes}
                onChange={(e) => setNewVisit({ ...newVisit, notes: e.target.value })}
                placeholder="Additional Notes"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              />
              <div className="absolute right-3 top-3">
                <div className="relative group">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute right-0 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                    Any additional information or observations from the visit
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleAddVisit}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Visit
          </button>
          <div className="grid grid-cols-1 gap-4">
            {data.medical_history.recent_visits.map((visit: RecentVisit, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium">{visit.doctor}</p>
                    <span className="text-sm text-gray-500">
                      {new Date(visit.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Reason: {visit.reason}</p>
                  {visit.notes && (
                    <p className="text-sm text-gray-500 mt-1">Notes: {visit.notes}</p>
                  )}
                </div>
                <RemoveButton 
                  onClick={() => {
                    const newVisits = data.medical_history.recent_visits.filter((_: any, i: number) => i !== index);
                    updateData('medical_history', {
                      ...data.medical_history,
                      recent_visits: newVisits
                    });
                  }} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <NavigationButtons onNext={nextStep} onPrev={prevStep} />
    </div>
  );
}; 