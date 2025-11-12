import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit2, FileText, AlertCircle } from 'lucide-react';
import JTIHeader from './JTIHeader';
import { API_CONFIG } from '../../../services/JTIFiling/apiConfig';

interface SubsequentCaseData {
    caseDocketId: string;
    caseTrackingId: string;
    caseTitle: string;
    caseType: string;
    caseCategory: string;
    caseStatus: string;
    filedDate: string;
}

interface Party {
    id: string;
    participantRefId: string;
    role: string;
    roleDescription: string;
    type: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    suffix?: string;
    name?: string;
    hasAttorney?: boolean;
    attorneys?: Attorney[];
}

interface Attorney {
    id: string;
    barNumberSearch: string;
    role: string;
    type: string;
    firm: string;
    barNumber: string;
    firstName: string;
    middle: string;
    lastName: string;
    suffix: string;
    email: string;
    altEmail: string;
    consentToEService: boolean;
}

interface DocumentData {
    id: string;
    documentType: string;
    documentTypeId: number;
    documentCode: string;
    fileName: string;
    fileSize?: number;
    fileType?: string;
}

interface LocationState {
    caseData?: {
        subsequentFilingData?: {
            caseData?: SubsequentCaseData;
            filedByParties?: Party[];
            filedAsToParties?: Party[];
        };
    };
    parties?: Party[];
    documentData?: DocumentData[];
    uploadedFiles?: File[];
}

const SubsequentCheckout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [messageToClerk, setMessageToClerk] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submissionResponse, setSubmissionResponse] = useState<any>(null);

    const paymentMethods = [
        'Credit Card',
        'Debit Card',
        'Bank Account',
        'Firm Account',
        'ACH'
    ];

    // Extract subsequent filing data
    const subsequentData = state?.caseData?.subsequentFilingData;
    const caseData = subsequentData?.caseData;
    const filedByParties = subsequentData?.filedByParties || [];
    const filedAsToParties = subsequentData?.filedAsToParties || [];
    const documents = state?.documentData || [];

    const hasData = !!caseData;

    // Debug logging
    useEffect(() => {
        console.log('=== SUBSEQUENT CHECKOUT DEBUG ===');
        console.log('Full state:', state);
        console.log('caseData:', caseData);
        console.log('filedByParties:', filedByParties);
        console.log('filedAsToParties:', filedAsToParties);
        console.log('documentData:', documents);
        console.log('================================');
    }, [state]);

    const handleEdit = (section: string) => {
        console.log(`Editing ${section}`);
        
        switch (section) {
            case 'case':
                // Navigate to subsequent case selection/view
                navigate('/services/jti-filing/subsequent-case', {
                    state: {
                        ...state,
                        editMode: true,
                        returnTo: 'checkout'
                    }
                });
                break;
            case 'parties':
                // Navigate to party management for subsequent filing
                navigate('/services/jti-filing/subsequent-party', {
                    state: {
                        ...state,
                        editMode: true,
                        returnTo: 'checkout'
                    }
                });
                break;
            case 'documents':
                // Navigate back to document upload
                navigate('/services/jti-filing/subsequent-documents', {
                    state: state
                });
                break;
        }
    };

    const handleBack = () => {
        navigate('/services/jti-filing/subsequent-documents', {
            state: state
        });
    };

    const handleSubmit = async () => {
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }

        try {
            setIsSubmitting(true);

            // Prepare the subsequent filing payload
            const payload = prepareSubsequentFilingPayload();

            console.log('Submitting subsequent filing payload:', payload);

            // Build the API URL for subsequent filing
            const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILING.SUBMIT_SUBSEQUENT_FILING(
                API_CONFIG.FILING_CREDENTIALS.USERNAME,
                API_CONFIG.FILING_CREDENTIALS.PASSWORD
            )}`;

            console.log('API URL:', apiUrl);

            // Make API call
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: API_CONFIG.FILING_HEADERS,
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            console.log('Subsequent filing submission response:', result);

            setSubmissionResponse(result);
            setShowSuccessModal(true);

        } catch (error) {
            console.error('Error submitting subsequent filing:', error);

            setSubmissionResponse({
                success: false,
                data: {
                    messageReceiptMessage: {
                        error: [{
                            errorCode: { value: 'NETWORK_ERROR' },
                            errorText: { 
                                value: error instanceof Error 
                                    ? error.message 
                                    : 'Network error: Unable to connect to the server. Please check your connection and try again.' 
                            }
                        }]
                    }
                }
            });
            setShowSuccessModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const prepareSubsequentFilingPayload = () => {
        // Get the first filed-by party for contact information
        const primaryParty = filedByParties[0];
        
        // Get attorney information if available
        const attorney = primaryParty?.attorneys?.[0];

        const payload = {
            caseDocketId: caseData?.caseDocketId,
            complaintTypeId: documents[0]?.documentTypeId?.toString() || "1108856",
            court: {
                organizationId: "https://aux-pub-efm-madera-ca.ecourt.com/",
                sourceText: "PLA",
                courtName: "Placer County Superior Court"
            },
            documents: documents.map((doc, index) => ({
                documentId: `doc${index}`,
                binaryUrl: "https://docs-educore-pro.s3.eu-west-2.amazonaws.com/1_compressed.pdf",
                descriptionCode: doc.documentCode,
                fileControlId: (2990 + index).toString(),
                complaintType: doc.documentTypeId?.toString() || "1108856",
                binaryFormat: doc.fileType || "application/pdf",
                metadataItems: [
                    {
                        code: "FILING_PARTY",
                        classType: "caseParticipant",
                        subType: "filed-by",
                        valueRestriction: "existing-data",
                        idReferences: [primaryParty?.id || primaryParty?.participantRefId]
                    },
                    {
                        code: "FILING_PARTY_ADDRESS",
                        classType: "contact",
                        contactValue: {
                            address1: "333 Davis Ct.",
                            address2: "",
                            city: "Sacramento",
                            state: "CA",
                            zip: "93636",
                            country: "US",
                            email: attorney?.email || "attorney@example.com",
                            telephoneType: "BUS",
                            addressType: "BUS"
                        }
                    },
                    ...(attorney ? [{
                        code: "EXISTING_ATTORNEY",
                        classType: "caseAssignment",
                        subType: "filed-by",
                        valueRestriction: "new-data",
                        attorneyValue: {
                            person: {
                                id: `ref${index + 2}`,
                                givenName: attorney.firstName,
                                middleName: attorney.middle || "",
                                surName: attorney.lastName,
                                barInformation: {
                                    id: attorney.barNumber,
                                    category: "BAR"
                                }
                            },
                            organization: {
                                id: `ref${index + 3}`
                            },
                            AssignmentRole: attorney.role,
                            contactInformation: {
                                telephone: {
                                    number: "2136330309",
                                    type: "W"
                                },
                                email: attorney.email,
                                mailingAddress: {
                                    street: attorney.firm || "111 N Hill St Rm 501",
                                    city: "Los Angeles",
                                    state: "CA",
                                    postalCode: "90012",
                                    locationType: "M"
                                }
                            }
                        }
                    }] : [])
                ]
            })),
            payment: {
                customerProfileId: "0",
                customerPaymentProfileId: "0",
                paymentType: paymentMethod
            },
            documentIdentificationId: `DOC${Date.now()}`,
            sendingMDELocationId: "https://aux-pub-efm-madera-ca.ecourt.com/"
        };

        return payload;
    };

    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return 'N/A';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    const getPartyDisplayName = (party: Party): string => {
        if (party.type === 'O' && party.name) {
            return party.name;
        }

        const parts = [
            party.firstName,
            party.middleName,
            party.lastName,
            party.suffix
        ].filter(Boolean);

        return parts.join(' ') || party.name || 'Unknown Party';
    };

    const getPartyRole = (role: string): string => {
        const roleMap: Record<string, string> = {
            'PLAIN': 'Plaintiff',
            'DEF': 'Defendant',
            'PETR': 'Petitioner',
            'RESP': 'Respondent',
            'APLT': 'Appellant',
            'APLEE': 'Appellee'
        };
        return roleMap[role] || role;
    };

    if (!hasData) {
        return (
            <div className="min-h-screen bg-gray-50">
                <JTIHeader />
                <main className="pt-24 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-1">No Filing Data Found</h4>
                                <p className="text-sm text-gray-700 mb-4">
                                    It appears you navigated directly to the checkout page. Please start a subsequent filing.
                                </p>
                                <button
                                    onClick={() => navigate('/services/jti-filing/subsequent-filing')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                >
                                    Start Subsequent Filing
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <JTIHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="space-y-6">
                    {/* Back Button */}
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Documents</span>
                    </button>

                    {/* Page Title */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">Review Subsequent Filing</h1>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                                Subsequent
                            </span>
                        </div>
                        <p className="text-gray-600">
                            Filing additional documents to existing case: <span className="font-semibold">{caseData?.caseTitle}</span>
                        </p>
                    </div>

                    {/* Existing Case Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 bg-purple-50 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-base font-bold text-gray-900">Existing Case Information</h2>
                            <button
                                onClick={() => handleEdit('case')}
                                className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Case Docket ID:</p>
                                <p className="text-sm text-gray-900 font-semibold">{caseData?.caseDocketId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Case Tracking ID:</p>
                                <p className="text-sm text-gray-900 font-normal">{caseData?.caseTrackingId}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-gray-600">Case Title:</p>
                                <p className="text-sm text-gray-900 font-normal">{caseData?.caseTitle}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Case Type:</p>
                                <p className="text-sm text-gray-900 font-normal">{caseData?.caseType}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Case Category:</p>
                                <p className="text-sm text-gray-900 font-normal">{caseData?.caseCategory}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status:</p>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    caseData?.caseStatus === 'OPEN' 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {caseData?.caseStatus}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Filed Date:</p>
                                <p className="text-sm text-gray-900 font-normal">
                                    {new Date(caseData?.filedDate || '').toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filed By Parties */}
                    {filedByParties.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 bg-blue-50 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-base font-bold text-gray-900">Filed By</h2>
                                <button
                                    onClick={() => handleEdit('parties')}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                {filedByParties.map((party, index) => (
                                    <div key={party.id} className="pb-6 last:pb-0 border-b border-gray-200 last:border-0">
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Party Role:</p>
                                                <p className="text-sm text-gray-900 font-normal">{party.roleDescription || getPartyRole(party.role)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Type:</p>
                                                <p className="text-sm text-gray-900 font-normal">
                                                    {party.type === 'P' ? 'Person' : 'Organization'}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-sm text-gray-600">Party Name:</p>
                                                <p className="text-sm text-gray-900 font-normal">{getPartyDisplayName(party)}</p>
                                            </div>

                                            {/* Attorney Info */}
                                            {party.hasAttorney && party.attorneys && party.attorneys.length > 0 && (
                                                <div className="col-span-2 mt-2">
                                                    <p className="text-sm text-gray-600 mb-2">Representation:</p>
                                                    <div className="space-y-2">
                                                        {party.attorneys.map((attorney) => (
                                                            <div key={attorney.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                                                    <div>
                                                                        <p className="text-xs text-gray-600">Attorney Name:</p>
                                                                        <p className="text-sm text-gray-900 font-normal">
                                                                            {attorney.firstName} {attorney.middle} {attorney.lastName}
                                                                        </p>
                                                                    </div>
                                                                    {attorney.firm && (
                                                                        <div>
                                                                            <p className="text-xs text-gray-600">Firm:</p>
                                                                            <p className="text-sm text-gray-900 font-normal">{attorney.firm}</p>
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <p className="text-xs text-gray-600">Bar Number:</p>
                                                                        <p className="text-sm text-gray-900 font-normal">{attorney.barNumber}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-600">Email:</p>
                                                                        <p className="text-sm text-gray-900 font-normal">{attorney.email}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Filed As To Parties */}
                    {filedAsToParties.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
                                <h2 className="text-base font-bold text-gray-900">Filed As To</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {filedAsToParties.map((party, index) => (
                                    <div key={party.id} className="pb-4 last:pb-0 border-b border-gray-200 last:border-0">
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Party Role:</p>
                                                <p className="text-sm text-gray-900 font-normal">{party.roleDescription || getPartyRole(party.role)}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-sm text-gray-600">Party Name:</p>
                                                <p className="text-sm text-gray-900 font-normal">{getPartyDisplayName(party)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Documents Section */}
                    {documents.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 bg-blue-50 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-base font-bold text-gray-900">Documents to File</h2>
                                <button
                                    onClick={() => handleEdit('documents')}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="flex items-start space-x-3">
                                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900 font-normal">{doc.documentType}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Code: {doc.documentCode}</p>
                                            <p className="text-xs text-gray-600 mt-1">{doc.fileName} - {formatFileSize(doc.fileSize)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Payment Method Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
                            <h2 className="text-base font-bold text-gray-900">Payment Method</h2>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm text-gray-900 mb-3">
                                Please select your payment method:<span className="text-red-500">*</span>
                            </label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-sm"
                            >
                                <option value="">Select payment method</option>
                                {paymentMethods.map((method) => (
                                    <option key={method} value={method}>
                                        {method}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Estimated Fees Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-base font-bold text-gray-900">Estimated Fees</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Filing Fee:</span>
                                    <span className="text-sm text-gray-900 font-medium">TBD</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Service Fee:</span>
                                    <span className="text-sm text-gray-900 font-medium">TBD</span>
                                </div>
                                <div className="border-t border-gray-200 pt-2 mt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-900">Total:</span>
                                        <span className="text-sm font-bold text-gray-900">TBD</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-4">
                                * Actual fees will be calculated by the court after submission
                            </p>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-between pt-4">
                        <button
                            onClick={handleBack}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!paymentMethod || isSubmitting}
                            className={`px-8 py-2.5 text-white rounded-lg transition font-medium shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                                paymentMethod && !isSubmitting
                                    ? 'bg-purple-600 hover:bg-purple-700'
                                    : 'bg-gray-400'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Subsequent Filing'
                            )}
                        </button>
                    </div>
                </div>
            </main>

            {/* Success/Error Modal */}
            {showSuccessModal && submissionResponse && (() => {
                const errorText = submissionResponse.data?.messageReceiptMessage?.error?.[0]?.errorText?.value || '';
                const isSuccess = errorText === 'No Error' || errorText === '';
                const errorCode = submissionResponse.data?.messageReceiptMessage?.error?.[0]?.errorCode?.value || '';

                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className={`px-6 py-4 border-b border-gray-200 ${
                                isSuccess
                                    ? 'bg-gradient-to-r from-green-50 to-green-100'
                                    : 'bg-gradient-to-r from-red-50 to-red-100'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                        isSuccess ? 'bg-green-600' : 'bg-red-600'
                                    }`}>
                                        {isSuccess ? (
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {isSuccess ? 'Subsequent Filing Submitted!' : 'Submission Failed'}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {isSuccess
                                                ? `Documents filed to case ${caseData?.caseDocketId}`
                                                : 'There was an error submitting your filing'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {!isSuccess && submissionResponse.data?.messageReceiptMessage?.error?.[0] && (
                                    <div className="bg-red-50 border-red-200 border rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-red-900">
                                                    Status {errorCode && `(Code: ${errorCode})`}
                                                </p>
                                                <p className="text-sm text-red-800 mt-1">
                                                    {errorText || 'Unknown error occurred'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isSuccess && (
                                    <>
                                        {submissionResponse.data?.messageReceiptMessage?.documentFileControlID && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-semibold text-gray-900">File Control ID(s):</p>
                                                <div className="space-y-2">
                                                    {submissionResponse.data.messageReceiptMessage.documentFileControlID.map((item: any, index: number) => (
                                                        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <span className="text-sm font-mono text-gray-900">{item.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {submissionResponse.data?.messageReceiptMessage?.documentIdentification && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-semibold text-gray-900">Document Identification:</p>
                                                <div className="space-y-2">
                                                    {submissionResponse.data.messageReceiptMessage.documentIdentification.map((doc: any, index: number) => (
                                                        <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                            {doc.identificationID?.map((id: any, idIndex: number) => (
                                                                <div key={idIndex} className="flex items-center justify-between">
                                                                    <span className="text-sm text-gray-600">ID:</span>
                                                                    <span className="text-sm font-mono text-gray-900">{id.value}</span>
                                                                </div>
                                                            ))}
                                                            {doc.items?.[0] && (
                                                                <div className="flex items-center justify-between mt-1">
                                                                    <span className="text-sm text-gray-600">Type:</span>
                                                                    <span className="text-sm text-gray-900">{doc.items[0].value}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {submissionResponse.data?.messageReceiptMessage?.documentReceivedDate?.[0]?.items?.[0] && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-semibold text-gray-900">Received Date:</p>
                                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="text-sm text-gray-900">
                                                            {new Date(submissionResponse.data.messageReceiptMessage.documentReceivedDate[0].items[0].value).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-blue-900">Important</p>
                                                    <p className="text-sm text-blue-800 mt-1">
                                                        Your subsequent filing has been submitted to case {caseData?.caseDocketId}. Save your File Control ID for reference.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {!isSuccess && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-yellow-900">What to do next</p>
                                                <p className="text-sm text-yellow-800 mt-1">
                                                    Please review the error and correct any issues. If the problem persists, contact support.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
                                {isSuccess ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowSuccessModal(false);
                                                navigate('/services/jti-filing/subsequent-filing');
                                            }}
                                            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                                        >
                                            File Another Document
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowSuccessModal(false);
                                                navigate('/services/jti-filing/dashboard');
                                            }}
                                            className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                                        >
                                            View Dashboard
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setShowSuccessModal(false)}
                                            className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => setShowSuccessModal(false)}
                                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                        >
                                            Fix and Retry
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default SubsequentCheckout;