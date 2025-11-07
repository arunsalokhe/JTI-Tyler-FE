import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, RotateCcw, Info } from 'lucide-react';
import JTIHeader from './JTIHeader';

interface CaseType {
  id: string;
  name: string;
}

interface CaseCategory {
  id: string;
  name: string;
}

const NewCase: React.FC = () => {
  const navigate = useNavigate();
  const [eFilingTitle, setEFilingTitle] = useState<string>('');
  const [caseType, setCaseType] = useState<string>('');
  const [caseCategory, setCaseCategory] = useState<string>('');
  const [jurisdictionalAmount, setJurisdictionalAmount] = useState<string>('');
  const [demandAmount, setDemandAmount] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [caseTypes, setCaseTypes] = useState<CaseType[]>([]);
  const [caseCategories, setCaseCategories] = useState<CaseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaseData();
  }, []);

  const fetchCaseData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 500));

      setCaseTypes([
        { id: 'civil-limited', name: 'Civil Limited' },
        { id: 'civil-unlimited', name: 'Civil Unlimited' },
        { id: 'small-claims', name: 'Small Claims' },
        { id: 'family-law', name: 'Family Law' },
        { id: 'probate', name: 'Probate' }
      ]);

      setCaseCategories([
        { id: 'personal-injury', name: 'Personal Injury' },
        { id: 'contract-dispute', name: 'Contract Dispute' },
        { id: 'property-damage', name: 'Property Damage' },
        { id: 'employment', name: 'Employment' },
        { id: 'other', name: 'Other' }
      ]);
    } catch (error) {
      console.error('Error fetching case data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEFilingTitle('');
    setCaseType('');
    setCaseCategory('');
    setJurisdictionalAmount('');
    setDemandAmount('');
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!eFilingTitle.trim()) {
      newErrors.eFilingTitle = 'eFiling Title is required';
    }

    if (!caseType) {
      newErrors.caseType = 'Case Type is required';
    }

    if (!caseCategory) {
      newErrors.caseCategory = 'Case Category is required';
    }

    if (!jurisdictionalAmount.trim()) {
      newErrors.jurisdictionalAmount = 'Jurisdictional Amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    console.log('Case Data:', {
      eFilingTitle,
      caseType,
      caseCategory,
      jurisdictionalAmount,
      demandAmount
    });

    // Navigate to Add Party page
    navigate('/services/jti-filing/add-party');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading case information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <JTIHeader />

      {/* Page Title Section */}
      {/* <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/services/jti-filing/home-page')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">JTI E-Filing</h1>
                <p className="text-sm text-gray-500">Create new case filing</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/services/jti-filing/home-page')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Edit Case Header */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">New Case</h2>
                <p className="text-sm text-gray-600 mt-1">Enter case details to begin your e-filing</p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-white rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Form
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* eFiling Title */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                eFiling Title
                <span className="text-red-500">*</span>
                <Info className="w-4 h-4 text-gray-400" />
              </label>
              <input
                type="text"
                value={eFilingTitle}
                onChange={(e) => {
                  setEFilingTitle(e.target.value);
                  if (errors.eFilingTitle) {
                    setErrors({ ...errors, eFilingTitle: '' });
                  }
                }}
                placeholder="Enter eFiling title"
                className={`w-full px-4 py-3 border ${errors.eFilingTitle ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition`}
              />
              {errors.eFilingTitle && (
                <p className="text-sm text-red-500 mt-1">{errors.eFilingTitle}</p>
              )}
              {!errors.eFilingTitle && !eFilingTitle && (
                <p className="text-sm text-red-500 mt-1">Required</p>
              )}
            </div>

            {/* Case Type */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Case Type<span className="text-red-500">*</span>
              </label>
              <select
                value={caseType}
                onChange={(e) => {
                  setCaseType(e.target.value);
                  if (errors.caseType) {
                    setErrors({ ...errors, caseType: '' });
                  }
                }}
                className={`w-full px-4 py-3 border ${errors.caseType ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white`}
              >
                <option value="">Select case type</option>
                {caseTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.caseType && (
                <p className="text-sm text-red-500 mt-1">{errors.caseType}</p>
              )}
            </div>

            {/* Case Category */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Case Category<span className="text-red-500">*</span>
              </label>
              <select
                value={caseCategory}
                onChange={(e) => {
                  setCaseCategory(e.target.value);
                  if (errors.caseCategory) {
                    setErrors({ ...errors, caseCategory: '' });
                  }
                }}
                className={`w-full px-4 py-3 border ${errors.caseCategory ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white`}
              >
                <option value="">Select case category</option>
                {caseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.caseCategory && (
                <p className="text-sm text-red-500 mt-1">{errors.caseCategory}</p>
              )}
            </div>

            {/* Jurisdictional Amount */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Jurisdictional Amnt<span className="text-red-500">*</span>
              </label>
              <select
                value={jurisdictionalAmount}
                onChange={(e) => {
                  setJurisdictionalAmount(e.target.value);
                  if (errors.jurisdictionalAmount) {
                    setErrors({ ...errors, jurisdictionalAmount: '' });
                  }
                }}
                className={`w-full px-4 py-3 border ${errors.jurisdictionalAmount ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white`}
              >
                <option value="">Select jurisdictional amount</option>
                <option value="0-10000">$0 - $10,000</option>
                <option value="10001-25000">$10,001 - $25,000</option>
                <option value="25001-50000">$25,001 - $50,000</option>
                <option value="50001-100000">$50,001 - $100,000</option>
                <option value="100001-unlimited">Over $100,000</option>
              </select>
              {errors.jurisdictionalAmount && (
                <p className="text-sm text-red-500 mt-1">{errors.jurisdictionalAmount}</p>
              )}
            </div>

            {/* Demand Amount */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Demand Amnt
              </label>
              <input
                type="text"
                value={demandAmount}
                onChange={(e) => setDemandAmount(e.target.value)}
                placeholder="Enter demand amount (optional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end rounded-b-xl">
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              Continue
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <div className="mt-6 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Important Information</h4>
            <p className="text-sm text-blue-800">
              All fields marked with <span className="text-red-500 font-semibold">*</span> are required.
              Please ensure all information is accurate before proceeding to the next step.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewCase;