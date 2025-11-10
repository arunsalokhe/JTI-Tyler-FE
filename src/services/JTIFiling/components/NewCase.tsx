import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RotateCcw, Info } from 'lucide-react';
import JTIHeader from './JTIHeader';
import { jtiFilingService } from '../jtiFilingService';
import { ApiError } from '../apiConfig';
import {
  CaseType,
  CaseCategory,
  JurisdictionalAmount,
  CaseFormData,
} from '../../../types/jtiFilingTypes';

const NewCase: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we have saved data from previous navigation
  const savedCaseData = location.state?.caseData;
  const savedParties = location.state?.parties;
  
  // Form state - Initialize with saved data if available
  const [formData, setFormData] = useState<CaseFormData>({
    eFilingTitle: savedCaseData?.eFilingTitle || '',
    caseType: savedCaseData?.caseType || '',
    caseCategory: savedCaseData?.caseCategory || '',
    jurisdictionalAmount: savedCaseData?.jurisdictionalAmount || '',
    demandAmount: savedCaseData?.demandAmount || '',
  });

  // Store full objects with code and name
  const [selectedCaseType, setSelectedCaseType] = useState<{code: string, name: string} | null>(
    savedCaseData?.selectedCaseType || null
  );
  const [selectedCaseCategory, setSelectedCaseCategory] = useState<{code: string, name: string} | null>(
    savedCaseData?.selectedCaseCategory || null
  );
  const [selectedJurisdictionalAmount, setSelectedJurisdictionalAmount] = useState<{code: string, name: string} | null>(
    savedCaseData?.selectedJurisdictionalAmount || null
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Data state
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([]);
  const [caseCategories, setCaseCategories] = useState<CaseCategory[]>([]);
  const [jurisdictionalAmounts, setJurisdictionalAmounts] = useState<JurisdictionalAmount[]>([]);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [loadingDependentData, setLoadingDependentData] = useState(false);

  useEffect(() => {
    fetchCaseTypes();
  }, []);

  // Restore dependent data when navigating back
  useEffect(() => {
    if (savedCaseData?.caseType) {
      handleCaseTypeChange(savedCaseData.caseType);
    }
  }, [savedCaseData]);

  /**
   * Fetch case types on component mount
   */
  const fetchCaseTypes = async () => {
    try {
      setLoading(true);
      const data = await jtiFilingService.getCaseTypes();
      console.log('Case Types data:', data);
      setCaseTypes(data.caseTypes || []);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Failed to load case types. Please refresh the page.' });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle case type change and fetch dependent data
   */
  const handleCaseTypeChange = async (value: string) => {
    // Find the selected case type object
    const selectedType = caseTypes.find(type => type.code === value);
    setSelectedCaseType(selectedType || null);

    // Update form data
    setFormData({
      ...formData,
      caseType: value,
      caseCategory: '',
      jurisdictionalAmount: '',
      demandAmount: '', // Clear demand amount when case type changes
    });

    // Clear dependent selections
    setSelectedCaseCategory(null);
    setSelectedJurisdictionalAmount(null);

    // Clear errors
    if (errors.caseType) {
      setErrors({ ...errors, caseType: '' });
    }

    // Reset dependent data
    setCaseCategories([]);
    setJurisdictionalAmounts([]);

    if (!value) return;

    // Fetch both categories and jurisdictional amounts in parallel
    try {
      setLoadingDependentData(true);
      
      const { categories, amounts } = await jtiFilingService.getCaseDependentData(value);
      console.log('Case categories and  amounts:', categories,amounts);
      setCaseCategories(categories.relatedCategories || []);
      setJurisdictionalAmounts(amounts || []);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({
          ...errors,
          caseCategory: 'Failed to load case categories.',
          jurisdictionalAmount: 'Failed to load jurisdictional amounts.',
        });
      }
    } finally {
      setLoadingDependentData(false);
    }
  };

  /**
   * Handle input change
   */
  const handleInputChange = (field: keyof CaseFormData, value: string) => {
    setFormData({ ...formData, [field]: value });

    // Handle case category selection
    if (field === 'caseCategory') {
      const selectedCategory = caseCategories.find(cat => cat.code === value);
      setSelectedCaseCategory(selectedCategory || null);
    }

    // Handle jurisdictional amount selection
    if (field === 'jurisdictionalAmount') {
      const selectedAmount = jurisdictionalAmounts.find(amt => amt.code === value);
      setSelectedJurisdictionalAmount(selectedAmount || null);
    }
    
    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  /**
   * Reset form to initial state
   */
  const handleReset = () => {
    setFormData({
      eFilingTitle: '',
      caseType: '',
      caseCategory: '',
      jurisdictionalAmount: '',
      demandAmount: '',
    });
    setSelectedCaseType(null);
    setSelectedCaseCategory(null);
    setSelectedJurisdictionalAmount(null);
    setErrors({});
    setCaseCategories([]);
    setJurisdictionalAmounts([]);
  };

  /**
   * Validate form before submission
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.eFilingTitle.trim()) {
      newErrors.eFilingTitle = 'eFiling Title is required';
    }

    if (!formData.caseType) {
      newErrors.caseType = 'Case Type is required';
    }

    if (!formData.caseCategory) {
      newErrors.caseCategory = 'Case Category is required';
    }

    // Only validate jurisdictional amount if it's available for this case type
    if (jurisdictionalAmounts.length > 0 && !formData.jurisdictionalAmount) {
      newErrors.jurisdictionalAmount = 'Jurisdictional Amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    // Prepare complete case data with both codes and names
    const completeCaseData = {
      ...formData,
      selectedCaseType,
      selectedCaseCategory,
      selectedJurisdictionalAmount,
    };

    console.log('Case Data:', completeCaseData);

    // Navigate to Add Party page with case data and any existing party data
    navigate('/services/jti-filing/add-party', {
      state: { 
        caseData: completeCaseData,
        parties: savedParties // Pass along saved party data if returning from AddParty
      }
    });
  };

  // Show loading spinner while fetching initial data
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Page Header */}
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
            {/* General Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            )}

            {/* eFiling Title */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                eFiling Title
                <span className="text-red-500">*</span>
                <Info className="w-4 h-4 text-gray-400" />
              </label>
              <input
                type="text"
                value={formData.eFilingTitle}
                onChange={(e) => handleInputChange('eFilingTitle', e.target.value)}
                placeholder="Enter eFiling title"
                className={`w-full px-4 py-3 border ${
                  errors.eFilingTitle ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition`}
              />
              {errors.eFilingTitle && (
                <p className="text-sm text-red-500 mt-1">{errors.eFilingTitle}</p>
              )}
              {!errors.eFilingTitle && !formData.eFilingTitle && (
                <p className="text-sm text-red-500 mt-1">Required</p>
              )}
            </div>

            {/* Case Type */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Case Type<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.caseType}
                onChange={(e) => handleCaseTypeChange(e.target.value)}
                className={`w-full px-4 py-3 border ${
                  errors.caseType ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white`}
              >
                <option value="">Select case type</option>
                {caseTypes.map((type) => (
                  <option key={type.code} value={type.code}>
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
                value={formData.caseCategory}
                onChange={(e) => handleInputChange('caseCategory', e.target.value)}
                disabled={!formData.caseType || loadingDependentData}
                className={`w-full px-4 py-3 border ${
                  errors.caseCategory ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {loadingDependentData
                    ? 'Loading categories...'
                    : !formData.caseType
                    ? 'Select case type first'
                    : caseCategories.length === 0
                    ? 'No categories available'
                    : 'Select case category'}
                </option>
                {caseCategories.map((category) => (
                  <option key={category.code} value={category.code}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.caseCategory && (
                <p className="text-sm text-red-500 mt-1">{errors.caseCategory}</p>
              )}
              {loadingDependentData && formData.caseType && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-indigo-600 border-t-transparent"></div>
                  Loading case categories...
                </p>
              )}
            </div>

            {/* Info message when jurisdictional amounts are not available */}
            {(formData.caseType && !loadingDependentData && jurisdictionalAmounts.length === 0) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-800">
                      Jurisdictional amount and demand amount are not required for this case type.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Jurisdictional Amount - Only show if available for this case type */}
            {(formData.caseType && !loadingDependentData && jurisdictionalAmounts.length > 0) && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Jurisdictional Amnt<span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.jurisdictionalAmount}
                  onChange={(e) => handleInputChange('jurisdictionalAmount', e.target.value)}
                  className={`w-full px-4 py-3 border ${
                    errors.jurisdictionalAmount ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white`}
                >
                  <option value="">Select jurisdictional amount</option>
                  {jurisdictionalAmounts.map((amount) => (
                    <option key={amount.code} value={amount.code}>
                      {amount.name}
                    </option>
                  ))}
                </select>
                {errors.jurisdictionalAmount && (
                  <p className="text-sm text-red-500 mt-1">{errors.jurisdictionalAmount}</p>
                )}
              </div>
            )}

            {/* Demand Amount - Only show if jurisdictional amounts are available */}
            {(formData.caseType && !loadingDependentData && jurisdictionalAmounts.length > 0) && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Demand Amnt
                </label>
                <input
                  type="text"
                  value={formData.demandAmount || ''}
                  onChange={(e) => handleInputChange('demandAmount', e.target.value)}
                  placeholder="Enter demand amount (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end rounded-b-xl">
            <button
              onClick={handleContinue}
              disabled={loadingDependentData}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
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