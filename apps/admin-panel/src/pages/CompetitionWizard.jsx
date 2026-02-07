import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const CompetitionWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    date: '',
    venue: '',
    organizer: '',
    numberOfReferees: 3,
    rulesPreset: 'iwf-standard',
    image: null,
    imagePreview: null,
    
    // Step 2: Weight Categories
    enableWomenCategories: true,
    enableMenCategories: true,
    customCategories: [],
  });

  const steps = [
    { number: 1, title: 'Competition Details', description: 'Basic information' },
    { number: 2, title: 'Weight Categories', description: 'Set up categories' },
    { number: 3, title: 'Rules & Settings', description: 'Configure competition rules' },
    { number: 4, title: 'Review & Create', description: 'Confirm and create' },
  ];

  const womenCategories = ['49kg', '55kg', '59kg', '64kg', '71kg', '76kg', '81kg', '+81kg'];
  const menCategories = ['61kg', '67kg', '73kg', '81kg', '89kg', '96kg', '102kg', '+102kg'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCompetition = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Upload image if provided
      let imageUrl = null;
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('file', formData.image);
        imageFormData.append('type', 'competition');
        
        const uploadRes = await fetch('http://localhost:5000/api/uploads', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: imageFormData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload image');
        }
        
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.data.url;
      }
      
      // Create competition with image URL
      const compRes = await fetch('http://localhost:5000/api/competitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          date: formData.date,
          location: formData.venue,
          organizer: formData.organizer,
          image_url: imageUrl,
          status: 'active',
        }),
      });

      if (!compRes.ok) throw new Error('Failed to create competition');
      const compData = await compRes.json();
      const competitionId = compData.data.id;

      toast.success('Competition created successfully!');
      navigate('/competitions');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create competition');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Competition Wizard</h1>
          <p className="text-gray-600">Set up your weightlifting competition in just a few steps</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex justify-between mb-6">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${
                    step.number <= currentStep
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.number}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{step.title}</p>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                {step.number < steps.length && (
                  <div
                    className={`absolute w-24 h-1 mt-6 transition-all ${
                      step.number < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                    style={{
                      left: `calc(${((step.number - 1) * 25) + 12}% + 3rem)`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          {/* STEP 1: Competition Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Competition Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competition Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Regional Championship 2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue *
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    placeholder="e.g., Central Arena"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organizer
                </label>
                <input
                  type="text"
                  value={formData.organizer}
                  onChange={(e) => handleInputChange('organizer', e.target.value)}
                  placeholder="e.g., Sports Federation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competition Image (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-600 mt-1">JPG, PNG, WebP (max 5MB)</p>
                  </div>
                  {formData.imagePreview && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                      <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Referees
                </label>
                <select
                  value={formData.numberOfReferees}
                  onChange={(e) => handleInputChange('numberOfReferees', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={1}>1 Referee</option>
                  <option value={2}>2 Referees</option>
                  <option value={3}>3 Referees</option>
                  <option value={4}>4 Referees</option>
                  <option value={5}>5 Referees</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Weight Categories */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Weight Categories</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={formData.enableWomenCategories}
                    onChange={(e) => handleInputChange('enableWomenCategories', e.target.checked)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <label className="text-gray-900 font-medium">Include Women's Categories</label>
                </div>
                {formData.enableWomenCategories && (
                  <div className="ml-8 grid grid-cols-4 gap-2">
                    {womenCategories.map((cat) => (
                      <div key={cat} className="bg-pink-100 text-pink-900 px-3 py-2 rounded text-center font-medium">
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={formData.enableMenCategories}
                    onChange={(e) => handleInputChange('enableMenCategories', e.target.checked)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <label className="text-gray-900 font-medium">Include Men's Categories</label>
                </div>
                {formData.enableMenCategories && (
                  <div className="ml-8 grid grid-cols-4 gap-2">
                    {menCategories.map((cat) => (
                      <div key={cat} className="bg-blue-100 text-blue-900 px-3 py-2 rounded text-center font-medium">
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Rules & Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Rules & Settings</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rules Preset
                </label>
                <select
                  value={formData.rulesPreset}
                  onChange={(e) => handleInputChange('rulesPreset', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="iwf-standard">IWF Standard Rules</option>
                  <option value="local-simplified">Local Simplified Rules</option>
                  <option value="custom">Custom Rules</option>
                </select>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-900 mb-3">Competition Settings</h3>
                <ul className="space-y-2 text-indigo-800">
                  <li>✓ Attempts per lift: 3</li>
                  <li>✓ Scoring: Total (Snatch + Clean & Jerk)</li>
                  <li>✓ Tie-breaking: Body weight, then Start number</li>
                  <li>✓ Decision rule: 2 out of 3 referees</li>
                  <li>✓ Sinclair scoring: Enabled</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Create */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Create</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Competition Name</p>
                  <p className="text-lg font-semibold text-gray-900">{formData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Venue</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formData.date} at {formData.venue}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formData.enableWomenCategories && formData.enableMenCategories
                      ? 'Women & Men'
                      : formData.enableWomenCategories
                      ? 'Women Only'
                      : 'Men Only'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Referees</p>
                  <p className="text-lg font-semibold text-gray-900">{formData.numberOfReferees}</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-900">
                  ✓ Ready to create! All information is complete and valid.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Previous</span>
          </button>

          <div className="text-gray-600 font-medium">
            Step {currentStep} of {steps.length}
          </div>

          {currentStep < steps.length ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <span>Next</span>
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleCreateCompetition}
              disabled={loading || !formData.name || !formData.date || !formData.venue}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Competition'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionWizard;
