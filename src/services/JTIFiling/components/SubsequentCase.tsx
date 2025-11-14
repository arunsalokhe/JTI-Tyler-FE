import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Info, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import JTIHeader from './JTIHeader';
import { jtiFilingService } from '../jtiFilingService';

interface JurisdictionalAmount {
    code: string;
    name: string;
}

interface CaseDetails {
    caseTrackingId: string;
    caseDocketId: string;
    caseTitle: string;
    caseCategory: string;
    caseType: string;
    caseStatus: string;
    statusDescription: string;
    filedDate: string;
    courtName: string;
}

interface EnrichedData {
    caseTypeName: string;
    caseTypeDescription: string;
    caseCategoryName: string;
    caseCategoryDescription: string;
}

interface LocationState {
    caseTrackingId?: string;
    caseDocketId?: string;
    eFilingTitle?: string;
    caseType?: string;
    caseCategory?: string;
    filedDate?: string;
    caseStatus?: string;
    statusDescription?: string;
    selectedCaseType?: {
        code: string;
        name: string;
        description?: string;
    };
    selectedCaseCategory?: {
        code: string;
        name: string;
        description?: string;
    };
    isSubsequentFiling?: boolean;
    subsequentFilingData?: {
        caseData: any;
        rawApiData: {
            caseDetails: CaseDetails;
            attorneys: any[];
            parties: any[];
            docketEntries: any[];
        };
        enrichedData: EnrichedData;
    };
}

const SubsequentCase: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get data from navigation state (passed from SubsequentFiling page)
    const locationState = location.state as LocationState;

    const [jurisdictionalAmount, setJurisdictionalAmount] = useState('');
    const [demandAmount, setDemandAmount] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [loadingJurisdictionalAmounts, setLoadingJurisdictionalAmounts] = useState(false);
    const [jurisdictionalAmounts, setJurisdictionalAmounts] = useState<JurisdictionalAmount[]>([]);

    useEffect(() => {
        // Check if we have the required data
        if (!locationState || !locationState.caseTrackingId) {
            console.error('No case data found in navigation state');
            navigate('/services/jti-filing/subsequent-filing');
            return;
        }

        console.log('SubsequentCase - Received location state:', locationState);

        // Fetch jurisdictional amounts for this case type
        if (locationState.caseType) {
            fetchJurisdictionalAmounts(locationState.caseType);
        }

        setLoading(false);
    }, [locationState]);

    /**
     * Fetch jurisdictional amounts based on case type
     */
    const fetchJurisdictionalAmounts = async (caseTypeCode: string) => {
        try {
            setLoadingJurisdictionalAmounts(true);
            const { amounts } = await jtiFilingService.getCaseDependentData(caseTypeCode);
            console.log('Jurisdictional amounts:', amounts);
            setJurisdictionalAmounts(amounts || []);
        } catch (error) {
            console.error('Error fetching jurisdictional amounts:', error);
            setErrors({
                ...errors,
                jurisdictionalAmount: 'Failed to load jurisdictional amounts.',
            });
        } finally {
            setLoadingJurisdictionalAmounts(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        if (field === 'jurisdictionalAmount') {
            setJurisdictionalAmount(value);
        } else if (field === 'demandAmount') {
            setDemandAmount(value);
        }

        // Clear error for this field
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    const validateForm = (): boolean => {
        // Since jurisdictional fields are commented out, always return true
        return true;
    };

    const handleContinue = () => {
        console.log('Continue clicked!');
        console.log('Location state:', locationState);

        // Navigate with whatever data we have
        navigate('/services/jti-filing/subsequent-party', {
            state: locationState // Just pass through everything we received
        });
    };

    const handleBack = () => {
        navigate('/services/jti-filing/subsequent-filing');
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

    // If no location state, show error
    if (!locationState) {
        return (
            <div className="min-h-screen bg-gray-50">
                <JTIHeader />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-800 font-medium">No case data found. Please search for a case first.</p>
                        <button
                            onClick={() => navigate('/services/jti-filing/subsequent-filing')}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Back to Search
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <JTIHeader />

            <main className="pt-24 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-6 border-b border-gray-200">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Subsequent Case</h2>
                                <p className="text-sm text-gray-600 mt-1">Review case details and enter additional information</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Case Tracking ID</p>
                                    <p className="text-sm font-semibold text-gray-900">{locationState.caseTrackingId}</p>
                                </div>
                                {locationState.caseStatus && (
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Status</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${locationState.caseStatus === 'OPEN'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {locationState.statusDescription || locationState.caseStatus}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                        {/* Case Information - Read Only */}
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Case Information
                            </h3>

                            <div className="space-y-4">
                                {/* Case Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Case Title
                                    </label>
                                    <div className="text-base font-medium text-gray-900 bg-white px-4 py-3 rounded-lg border border-gray-200">
                                        {locationState.eFilingTitle || 'N/A'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Case Docket ID */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Case Docket ID
                                        </label>
                                        <div className="text-base font-medium text-gray-900 bg-white px-4 py-3 rounded-lg border border-gray-200">
                                            {locationState.caseDocketId || 'N/A'}
                                        </div>
                                    </div>

                                    {/* Filed Date */}
                                    {locationState.filedDate && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Filed Date
                                            </label>
                                            <div className="text-base font-medium text-gray-900 bg-white px-4 py-3 rounded-lg border border-gray-200">
                                                {new Date(locationState.filedDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Case Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Case Type
                                        </label>
                                        <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                                            <p className="text-base font-medium text-gray-900">
                                                {locationState.selectedCaseType?.name || locationState.caseType || 'N/A'}
                                            </p>
                                            {/* {locationState.selectedCaseType?.code && (
                        <p className="text-xs text-gray-500 mt-1">Code: {locationState.selectedCaseType.code}</p>
                      )} */}
                                        </div>
                                    </div>

                                    {/* Case Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Case Category
                                        </label>
                                        <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                                            <p className="text-base font-medium text-gray-900">
                                                {locationState.selectedCaseCategory?.name || locationState.caseCategory || 'N/A'}
                                            </p>
                                            {/* {locationState.selectedCaseCategory?.code && (
                        <p className="text-xs text-gray-500 mt-1">Code: {locationState.selectedCaseCategory.code}</p>
                      )} */}
                                        </div>
                                    </div>
                                </div>

                                {/* Show info if no jurisdictional amounts available */}
                                {/* {!loadingJurisdictionalAmounts && jurisdictionalAmounts.length === 0 && (
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
                )} */}

                                {/* Jurisdictional Amount - Only show if available */}
                                {jurisdictionalAmounts.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Jurisdictional Amnt<span className="text-red-500">*</span>
                      </label>
                      <select
                        value={jurisdictionalAmount}
                        onChange={(e) => handleInputChange('jurisdictionalAmount', e.target.value)}
                        disabled={loadingJurisdictionalAmounts}
                        className={`w-full px-4 py-3 border ${
                          errors.jurisdictionalAmount ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white disabled:bg-gray-100`}
                      >
                        <option value="">
                          {loadingJurisdictionalAmounts ? 'Loading...' : 'Select jurisdictional amount'}
                        </option>
                        {jurisdictionalAmounts.map((amount) => (
                          <option key={amount.code} value={amount.code}>
                            {amount.name}
                          </option>
                        ))}
                      </select>
                      {errors.jurisdictionalAmount && (
                        <p className="text-sm text-red-500 mt-1">{errors.jurisdictionalAmount}</p>
                      )}
                    </div> */}

                                        {/* Demand Amount */}
                                        {/* <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Demand Amnt
                      </label>
                      <input
                        type="text"
                        value={demandAmount}
                        onChange={(e) => handleInputChange('demandAmount', e.target.value)}
                        placeholder="Enter demand amount (optional)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                      />
                    </div> */}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between rounded-b-xl">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <button
                            onClick={handleContinue}
                            disabled={loadingJurisdictionalAmounts}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                            <ArrowRight className="w-4 h-4" />
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
                            This is a subsequent filing for an existing case. Case details are pre-filled from the system and cannot be modified.
                            {jurisdictionalAmounts.length > 0}
                            {/* ' Please enter the jurisdictional amount to continue with your filing.' */}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SubsequentCase;