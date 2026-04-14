import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepProgressBar from '../components/StepProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';

const initialForm = {
  age: '', gender: '', chiefComplaint: '', duration: '',
  mood: '', fears: [], anxietyTriggers: '', sleepQuality: '', 
  sleepPosition: '', dreams: '',
  thermal: '', thirst: '', sweat: '', cravings: [], 
  aversions: [], aggravationTime: [],
  location: '', sensations: [], betterFrom: '', 
  worseFrom: '', associatedSymptoms: ''
};

const analysisMessages = [
  "Analyzing your symptom totality...",
  "Consulting Kent's Repertory...",
  "Reviewing Boericke's Materia Medica...",
  "Identifying your constitutional type...",
  "Preparing your remedy analysis..."
];

const Consult = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setMsgIndex((prev) => (prev + 1) % analysisMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMultiSelect = (field, value) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item) => item !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const renderMultiSelect = (field, options) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
        {options.map((opt) => {
          const isSelected = formData[field].includes(opt);
          return (
            <label 
              key={opt}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                isSelected ? 'bg-green-100 border-green-500 text-green-800 font-medium' : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={isSelected}
                onChange={() => handleMultiSelect(field, opt)}
              />
              <span className="text-sm">{opt}</span>
            </label>
          );
        })}
      </div>
    );
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.age || !formData.gender || !formData.chiefComplaint) return 'Age, gender, and chief complaint are required.';
    }
    if (currentStep === 2) {
      if (!formData.mood) return 'Please describe your mood/personality.';
    }
    if (currentStep === 3) {
      if (!formData.thermal) return 'Please select your thermal sensitivity.';
    }
    if (currentStep === 4) {
      if (!formData.location) return 'Please specify the symptom location.';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setCurrentStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    setError('');
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setIsAnalyzing(true);

    try {
      const res = await api.post('/api/analyze', formData);
      sessionStorage.setItem('homeoai_result', JSON.stringify(res.data));
      sessionStorage.setItem('homeoai_formdata', JSON.stringify(formData));
      navigate('/result');
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
      setError(err.response?.data?.error || 'Analysis failed. Please check your data and try again.');
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-green-50 fixed inset-0 z-50">
        <LoadingSpinner text={analysisMessages[msgIndex]} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-t-8 border-green-600">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">New Consultation</h1>
          
          <StepProgressBar currentStep={currentStep} totalSteps={4} />

          {error && (
            <div className="bg-red-50 p-4 rounded-md mb-6 border-l-4 border-red-500">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="mt-8 space-y-6">
            {currentStep === 1 && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-semibold mb-4 text-green-800">1. Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age <span className="text-red-500">*</span></label>
                    <input type="number" min="1" max="120" name="age" value={formData.age} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border bg-white">
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Chief Complaint <span className="text-red-500">*</span></label>
                    <textarea name="chiefComplaint" value={formData.chiefComplaint} onChange={handleChange} rows="3" placeholder="Describe your main health concern" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 3 months, 2 weeks" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-semibold mb-4 text-green-800">2. Mental & Emotional</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mood/Personality <span className="text-red-500">*</span></label>
                    <textarea name="mood" value={formData.mood} onChange={handleChange} rows="3" placeholder="Describe your general mood, temperament, how you handle stress, emotional tendencies..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fears (Select all that apply)</label>
                    {renderMultiSelect('fears', ['Heights', 'Darkness', 'Crowds', 'Disease', 'Death', 'Being alone', 'Failure', 'Thunderstorms', 'Spiders/Insects', 'Financial loss'])}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Anxiety Triggers</label>
                    <textarea name="anxietyTriggers" value={formData.anxietyTriggers} onChange={handleChange} rows="2" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Quality</label>
                      <div className="flex flex-wrap gap-4">
                        {['Good', 'Fair', 'Poor', 'Disturbed'].map((opt) => (
                          <label key={opt} className="inline-flex items-center">
                            <input type="radio" name="sleepQuality" value={opt} checked={formData.sleepQuality === opt} onChange={handleChange} className="form-radio text-green-600 focus:ring-green-500" />
                            <span className="ml-2 text-sm text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Position</label>
                      <div className="flex flex-wrap gap-4">
                        {['Back', 'Left side', 'Right side', 'Stomach'].map((opt) => (
                          <label key={opt} className="inline-flex items-center">
                            <input type="radio" name="sleepPosition" value={opt} checked={formData.sleepPosition === opt} onChange={handleChange} className="form-radio text-green-600 focus:ring-green-500" />
                            <span className="ml-2 text-sm text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dreams (Optional)</label>
                    <textarea name="dreams" value={formData.dreams} onChange={handleChange} rows="2" placeholder="Recurring dreams or nightmares if any" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-semibold mb-4 text-green-800">3. Physical Generals</h2>
                <div className="space-y-6">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thermal Sensitivity <span className="text-red-500">*</span></label>
                    <div className="grid gap-3">
                      {['Hot constitution - feel warm always', 'Cold constitution - feel cold always', 'Mixed'].map((opt) => (
                        <label key={opt} className="inline-flex items-center">
                          <input type="radio" name="thermal" value={opt} checked={formData.thermal === opt} onChange={handleChange} className="form-radio text-green-600 focus:ring-green-500" />
                          <span className="ml-3 text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thirst</label>
                      <select name="thirst" value={formData.thirst} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border bg-white">
                        <option value="">Select Level</option>
                        {['Very Low', 'Low', 'Moderate', 'High', 'Very High'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sweat Amount</label>
                      <select name="sweat" value={formData.sweat} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border bg-white">
                        <option value="">Select Amount</option>
                        {['None', 'Slight', 'Moderate', 'Profuse'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Food Cravings</label>
                      {renderMultiSelect('cravings', ['Sweet', 'Salty', 'Sour', 'Spicy', 'Cold food/drinks', 'Warm food/drinks', 'Fatty/rich food', 'Milk/dairy', 'Eggs', 'Bread/starchy'])}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Food Aversions</label>
                      {renderMultiSelect('aversions', ['Sweet', 'Salty', 'Sour', 'Spicy', 'Cold food/drinks', 'Warm food/drinks', 'Fatty/rich food', 'Milk/dairy', 'Eggs', 'Bread/starchy'])}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time of Aggravation (Select all that apply)</label>
                    {renderMultiSelect('aggravationTime', ['Morning (6-9am)', 'Forenoon (9-12)', 'Afternoon (12-3pm)', 'Evening (6-9pm)', 'Night (9pm-12)', 'Midnight (12-3am)', '3am-5am (important!)', 'After eating', 'Before eating'])}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-semibold mb-4 text-green-800">4. Particular Complaints</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Symptom Location <span className="text-red-500">*</span></label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Head, chest, joints, stomach..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sensations (Select all that apply)</label>
                    {renderMultiSelect('sensations', ['Burning', 'Aching/Dull pain', 'Sharp/Shooting', 'Pressing/Heavy', 'Itching', 'Throbbing/Pulsating', 'Cramping', 'Numbness/Tingling', 'Soreness', 'Rawness'])}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Better from (Amelioration)</label>
                      <textarea name="betterFrom" value={formData.betterFrom} onChange={handleChange} rows="2" placeholder="Rest, warmth, cold, pressure, motion..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Worse from (Aggravation)</label>
                      <textarea name="worseFrom" value={formData.worseFrom} onChange={handleChange} rows="2" placeholder="Cold, heat, morning, movement, eating..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Associated Symptoms</label>
                    <textarea name="associatedSymptoms" value={formData.associatedSymptoms} onChange={handleChange} rows="3" placeholder="Other symptoms you experience along with the main complaint" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border" />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8 flex justify-between border-t border-gray-200">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  Previous
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-8 py-3 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:-translate-y-1"
                >
                  Analyze My Symptoms →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consult;
