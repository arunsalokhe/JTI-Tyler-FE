import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Users,
  Scale,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building2,
  User,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Download,
  Printer,
  Share2,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import JTIHeader from './JTIHeader';
import { fetchCaseDetails, getDefaultCaseRequest, formatCaseDate, getStatusColor } from '../caseDetailsApi';
import { GetCaseResponse } from '../../../types/Casedetailstypes';


const CaseDetails: React.FC = () => {
  const { caseTrackingId } = useParams<{ caseTrackingId: string }>();
  const navigate = useNavigate();
  
  const [caseData, setCaseData] = useState<GetCaseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'parties' | 'attorneys' | 'docket' | 'related'>('overview');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    if (caseTrackingId) {
      loadCaseDetails();
    }
  }, [caseTrackingId]);

  const loadCaseDetails = async (isRetry: boolean = false) => {
    if (!caseTrackingId) return;

    if (!isRetry) {
      setIsLoading(true);
      setError(null);
      setRetryCount(0);
    }

    try {
      const request = getDefaultCaseRequest(caseTrackingId);
      const data = await fetchCaseDetails(request);

      if (data.success) {
        setCaseData(data);
        setError(null);
        setRetryCount(0);
      } else {
        // Check if it's a file locking error
        const isFileLockError = data.error && 
          (data.error.includes('being used by another process') || 
           data.error.includes('cannot access the file'));
        
        if (isFileLockError && retryCount < MAX_RETRIES) {
          // Retry after a short delay for file locking issues
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            loadCaseDetails(true);
          }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s, 3s
          return;
        }
        
        // Format error message for user
        let errorMessage = data.message || 'Failed to load case details';
        if (isFileLockError) {
          errorMessage = 'The system is temporarily busy. Please try again in a moment.';
        } else if (data.error) {
          // Show technical error in development, user-friendly in production
          errorMessage = `${data.message}${process.env.NODE_ENV === 'development' ? ': ' + data.error : ''}`;
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading case details';
      
      // Check if it's a network or timeout error that might benefit from retry
      const isNetworkError = errorMessage.includes('fetch') || 
                            errorMessage.includes('network') || 
                            errorMessage.includes('timeout');
      
      if (isNetworkError && retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          loadCaseDetails(true);
        }, 1000 * (retryCount + 1));
        return;
      }
      
      setError(errorMessage);
      console.error('Error loading case details:', err);
    } finally {
      if (!isRetry) {
        setIsLoading(false);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement download functionality
    console.log('Download case details');
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Share case details');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <JTIHeader />
        <main className="pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <span className="ml-3 text-gray-600">Loading case details...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !caseData) {
    // Show loader during retries
    if (retryCount > 0 && retryCount < MAX_RETRIES) {
      return (
        <div className="min-h-screen bg-gray-50">
          <JTIHeader />
          <main className="pt-24 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900 mb-2">Loading case details...</p>
                  <p className="text-sm text-gray-600">
                    Retrying... (Attempt {retryCount} of {MAX_RETRIES})
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }

    // Show error only after retries exhausted or non-retryable error
    return (
      <div className="min-h-screen bg-gray-50">
        <JTIHeader />
        <main className="pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-16">
              <div className="text-center max-w-md">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-900 mb-1">Error Loading Case</p>
                <p className="text-gray-600 mb-4">{error || 'Case not found'}</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setRetryCount(0);
                      loadCaseDetails();
                    }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/services/jti-filing/my-previous-filings')}
                    className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Back to Cases
                  </button>
                </div>
                
                {retryCount >= MAX_RETRIES && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                    <p className="text-sm font-medium text-yellow-900 mb-1">
                      Multiple attempts failed
                    </p>
                    <p className="text-xs text-yellow-800">
                      The system may be experiencing high load. Please wait a moment and try again, 
                      or contact support if the issue persists.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { data } = caseData;
  const { caseDetails, attorneys, parties, docketEntries, otherEntities, incidentAddress, relatedCaseAssignments } = data;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'parties', label: `Parties (${parties.length})`, icon: Users },
    { id: 'attorneys', label: `Attorneys (${attorneys.length})`, icon: Scale },
    { id: 'docket', label: `Docket (${docketEntries.length})`, icon: Calendar },
    { id: 'related', label: 'Related', icon: Building2 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <JTIHeader />

      <main className="pt-24 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/services/jti-filing/my-previous-filings')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cases
        </button>

        {/* Case Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 sm:px-8 py-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-2xl font-bold text-gray-900">
                    {caseDetails.caseTitle}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(caseDetails.caseStatus)}`}>
                    {caseDetails.statusDescription}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Case #{caseDetails.caseDocketId}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Filed: {formatCaseDate(caseDetails.filedDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    Tracking ID: {caseDetails.caseTrackingId}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              {/* <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                  title="Print"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div> */}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Case Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Case Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Docket ID</span>
                    <span className="text-sm font-semibold text-gray-900">{caseDetails.caseDocketId}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Tracking ID</span>
                    <span className="text-sm font-semibold text-gray-900">{caseDetails.caseTrackingId}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Case Type</span>
                    <span className="text-sm font-semibold text-gray-900">{caseDetails.caseType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Case Category</span>
                    <span className="text-sm font-semibold text-gray-900">{caseDetails.caseCategory}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${getStatusColor(caseDetails.caseStatus)}`}>
                      {caseDetails.statusDescription}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Filed Date</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCaseDate(caseDetails.filedDate)}</span>
                  </div>
                  {caseDetails.courtName && (
                    <div className="flex justify-between py-2">
                      <span className="text-sm font-medium text-gray-500">Court</span>
                      <span className="text-sm font-semibold text-gray-900">{caseDetails.courtName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Incident Address */}
              {incidentAddress && (incidentAddress.street || incidentAddress.city) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    Incident Address
                  </h2>
                  <div className="space-y-2">
                    {incidentAddress.street && (
                      <p className="text-sm text-gray-900">{incidentAddress.street}</p>
                    )}
                    <p className="text-sm text-gray-900">
                      {[incidentAddress.city, incidentAddress.state, incidentAddress.postalCode || incidentAddress.zip]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    {incidentAddress.country && (
                      <p className="text-sm text-gray-900">{incidentAddress.country}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Summary</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{parties.length}</p>
                    <p className="text-xs text-gray-600">Parties</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Scale className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{attorneys.length}</p>
                    <p className="text-xs text-gray-600">Attorneys</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{docketEntries.length}</p>
                    <p className="text-xs text-gray-600">Docket Entries</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Building2 className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{otherEntities.length}</p>
                    <p className="text-xs text-gray-600">Other Entities</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parties Tab */}
          {activeTab === 'parties' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Case Parties ({parties.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {parties.map((party, index) => (
                  <div key={`${party.id}-${index}`} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {party.type === 'Person' ? (
                            <User className="w-6 h-6 text-indigo-600" />
                          ) : (
                            <Building2 className="w-6 h-6 text-indigo-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{party.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {party.roleDescription}
                            </span>
                            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              {party.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">ID: {party.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {parties.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No parties found for this case
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attorneys Tab */}
          {activeTab === 'attorneys' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-600" />
                  Attorneys ({attorneys.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {attorneys.map((attorney, index) => (
                  <div key={`${attorney.id}-${index}`} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Scale className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{attorney.name}</h3>
                          {attorney.organization && (
                            <p className="text-sm text-gray-600 mt-1">{attorney.organization}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                              Bar #: {attorney.barNumber}
                            </span>
                            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              {attorney.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="lg:text-right space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {attorney.contactInfo.address.street}<br />
                            {attorney.contactInfo.address.city}, {attorney.contactInfo.address.state} {attorney.contactInfo.address.zip}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{attorney.contactInfo.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {attorneys.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No attorneys found for this case
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Docket Tab */}
          {activeTab === 'docket' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Docket Entries ({docketEntries.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {docketEntries.map((entry, index) => (
                  <div key={`${entry.documentId}-${index}`} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">{entry.description}</h3>
                            <p className="text-sm text-gray-500 mt-1">Document ID: {entry.documentId}</p>
                          </div>
                          <span className="text-sm text-gray-600 whitespace-nowrap">
                            {formatCaseDate(entry.entryDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {docketEntries.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No docket entries found for this case
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Related Tab */}
          {activeTab === 'related' && (
            <div className="space-y-6">
              {/* Other Entities */}
              {otherEntities.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                      Other Entities ({otherEntities.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {otherEntities.map((entity, index) => (
                      <div key={`${entity.id}-${index}`} className="p-6 hover:bg-gray-50 transition">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {entity.type === 'Person' ? (
                              <User className="w-6 h-6 text-orange-600" />
                            ) : (
                              <Building2 className="w-6 h-6 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{entity.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                {entity.type}
                              </span>
                              <span className="text-sm text-gray-500">
                                {entity.identificationType}: {entity.identificationId}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">ID: {entity.id}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Case Assignments */}
              {relatedCaseAssignments.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      Related Case Assignments ({relatedCaseAssignments.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {relatedCaseAssignments.map((assignment, index) => (
                      <div key={`${assignment.participantId}-${index}`} className="p-6 hover:bg-gray-50 transition">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">{assignment.description}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Participant: {assignment.participantId} → Attorney: {assignment.attorneyAssignmentId}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                            {assignment.associationType}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {otherEntities.length === 0 && relatedCaseAssignments.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                  No related information found for this case
                </div>
              )}
            </div>
          )}
        </div>

        {/* Query Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Data retrieved at: {new Date(caseData.queriedAt).toLocaleString()}
        </div>
      </main>
    </div>
  );
};

export default CaseDetails;