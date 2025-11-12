import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Info, Search, AlertCircle } from 'lucide-react';
import JTIHeader from './JTIHeader';
import { caseService } from '../../../services/JTIFiling/caseService';
import { mapGetCaseDataToAppFormat } from '../../../types/jtiFilingTypes';

const SubsequentFiling: React.FC = () => {
  const navigate = useNavigate();
  const [caseNumber, setCaseNumber] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  const handleReset = () => {
    setCaseNumber('');
    setErrors({});
    setApiError('');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!caseNumber.trim()) {
      newErrors.caseNumber = 'Case Tracking ID is required';
    } else if (caseNumber.trim().length < 1) {
      newErrors.caseNumber = 'Please enter a valid case tracking ID';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSearching(true);
    setApiError('');

    try {
      // Make API call to search case with enriched names
      const response = await caseService.getCaseWithNames(caseNumber.trim());

      if (response.success && response.data) {
        console.log('Case found:', response);
        console.log('Enriched data:', response.enrichedData);

        // Map API data to app format
        const mappedData = mapGetCaseDataToAppFormat(response.data);

        // Navigate to NewCase page with pre-populated data (read-only mode for subsequent filing)
        navigate('/services/jti-filing/subsequent-case', {
          state: { 
            ...mappedData.caseData,
            // Add enriched names
            selectedCaseType: {
              code: response.data.caseDetails.caseType,
              name: response.enrichedData?.caseTypeName || response.data.caseDetails.caseType,
              description: response.enrichedData?.caseTypeDescription || '',
            },
            selectedCaseCategory: {
              code: response.data.caseDetails.caseCategory,
              name: response.enrichedData?.caseCategoryName || response.data.caseDetails.caseCategory,
              description: response.enrichedData?.caseCategoryDescription || '',
            },
            isSubsequentFiling: true,
            subsequentFilingData: {
              ...mappedData,
              rawApiData: response.data,
              enrichedData: response.enrichedData,
            },
          }
        });
      } else {
        setApiError('Case not found. Please check the case tracking ID and try again.');
      }
    } catch (error: any) {
      console.error('Error searching case:', error);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error ||
                           'Unable to retrieve case details';
        setApiError(errorMessage);
      } else if (error.request) {
        // Request made but no response
        setApiError('Unable to connect to the server. Please check your internet connection.');
      } else {
        // Other errors
        setApiError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <JTIHeader />

      {/* Main Content */}
      <main className="pt-24 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Subsequent Filing Header */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Subsequent Filing</h2>
                <p className="text-sm text-gray-600 mt-1">Enter case tracking ID to file additional documents</p>
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
            {/* API Error Alert */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-900 mb-1">Error</h4>
                  <p className="text-sm text-red-800">{apiError}</p>
                </div>
                <button
                  onClick={() => setApiError('')}
                  className="text-red-600 hover:text-red-800 text-xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
            )}

            {/* Case Tracking ID Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                Case Tracking ID
                <span className="text-red-500">*</span>
                <Info className="w-4 h-4 text-gray-400" />
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => {
                    setCaseNumber(e.target.value);
                    if (errors.caseNumber) {
                      setErrors({ ...errors, caseNumber: '' });
                    }
                    if (apiError) {
                      setApiError('');
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter case tracking ID (e.g., 1731)"
                  className={`w-full px-4 py-3 pr-12 border ${
                    errors.caseNumber || apiError ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition`}
                  disabled={isSearching}
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.caseNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.caseNumber}</p>
              )}
              {!errors.caseNumber && !caseNumber && !apiError && (
                <p className="text-sm text-gray-500 mt-1">Required</p>
              )}
              {!errors.caseNumber && caseNumber && !apiError && (
                <p className="text-sm text-gray-500 mt-1">
                  We'll search for this case in the system
                </p>
              )}
            </div>

            {/* Case Tracking ID Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Case Tracking ID Information</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Enter the Case Tracking ID from your original filing</p>
                <p>• Example: <span className="font-mono bg-white px-2 py-1 rounded">1731</span></p>
                <p>• This is typically a numeric ID assigned when the case was first filed</p>
                <p>• The system will retrieve all case details including parties, attorneys, and docket entries</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between rounded-b-xl">
            <button
              onClick={() => navigate('/services/jti-filing/home-page')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition"
              disabled={isSearching}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSearching || !caseNumber.trim()}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search Case
                </>
              )}
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
              Subsequent filing is used to add documents to an existing case. Make sure you have the correct case tracking ID from your original filing or court documents. The case must be active in the system to accept additional filings.
            </p>
          </div>
        </div>

        {/* Quick Help Section */}
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help Finding Your Case Tracking ID?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Check Court Documents</h4>
                <p className="text-sm text-gray-600">Your case tracking ID appears on all official court documents and correspondence</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Original Filing Receipt</h4>
                <p className="text-sm text-gray-600">Check your email receipt from when you first filed the case</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">My Filings</h4>
                <p className="text-sm text-gray-600">View your previous filings in the dashboard to find case tracking IDs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-sm">4</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Contact Support</h4>
                <p className="text-sm text-gray-600">Our support team can help you locate your case tracking ID</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubsequentFiling;