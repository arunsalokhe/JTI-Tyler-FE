import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit2, FileText, AlertCircle } from 'lucide-react';
import JTIHeader from './JTIHeader';
import { API_CONFIG } from '../../../services/JTIFiling/apiConfig';

interface CaseData {
    eFilingTitle: string;
    caseType: string;
    caseCategory: string;
    jurisdictionalAmount: string;
    demandAmount?: string;
    selectedCaseType?: {
        code: string;
        name: string;
    };
    selectedCaseCategory?: {
        code: string;
        name: string;
    };
    selectedJurisdictionalAmount?: {
        code: string;
        name: string;
    };
}

interface Party {
    id?: string;
    role: string; // "PLAIN", "DEF", etc.
    type: string; // "P" for person, "O" for organization

    // Person fields
    firstName?: string;
    middleName?: string;
    lastName?: string;
    suffix?: string;
    name?: string;

    // Self-represented party fields
    representingYourself?: boolean;
    hasAttorney?: boolean;
    selfRepAddress?: string;
    selfRepAddress2?: string;
    selfRepCity?: string;
    selfRepState?: string;
    selfRepZip?: string;
    selfRepCountry?: string;
    selfRepEmail?: string;
    selfRepPhone?: string;

    // Other fields
    filingFeesExemption?: boolean;
    needInterpreter?: boolean;
    partySubtype?: {
        guardianAdLitem: boolean;
        incompetentPerson: boolean;
        minor: boolean;
    };

    // Attorney information
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

interface FiledAsToParty {
    id?: string;
    role: string; // "DEF", "PLAIN", etc.
    type: string; // "P" for person

    // Person fields
    firstName?: string;
    middleName?: string;
    lastName?: string;
    suffix?: string;
    name?: string;

    // Party subtype
    partySubtype?: {
        guardianAdLitem: boolean;
        incompetentPerson: boolean;
        minor: boolean;
    };
}

interface DocumentData {
    id: string;
    isLeadDocument: boolean;
    documentType: string;
    documentTypeId: number | null;
    documentCode: string;
    fileName: string;
    fileSize?: number;
    fileType?: string;
}

interface LocationState {
    caseTypeId?: string;
    caseData?: CaseData;
    partyData?: Party[];
    partyWithFiledAsToData?: FiledAsToParty[];
    documentData?: DocumentData[];
    uploadedFiles?: File[];
}

const Checkout: React.FC = () => {
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
        'Firm Account'
    ];

    // Check if data is available
    const hasData = state && (state.caseData || state.partyData || state.documentData);

    // Debug logging
    useEffect(() => {
        console.log('=== CHECKOUT PAGE DEBUG ===');
        console.log('Full state:', state);
        console.log('Has state?', !!state);
        console.log('caseData:', state?.caseData);
        console.log('partyData:', state?.partyData);
        console.log('partyWithFiledAsToData:', state?.partyWithFiledAsToData);
        console.log('documentData:', state?.documentData);
        console.log('hasData?', hasData);
        console.log('========================');
    }, [state]);

    useEffect(() => {
        if (!hasData) {
            console.warn('No data found in state. User may have navigated directly to checkout.');
        }
    }, [hasData]);

    const handleEdit = (section: string) => {
        console.log(`Editing ${section}`);
        console.log('Current state:', state);

        switch (section) {
            case 'case':
                navigate('/services/jti-filing/new-case', {
                    state: {
                        caseTypeId: state?.caseTypeId,
                        caseData: state?.caseData,
                        partyData: state?.partyData,
                        partyWithFiledAsToData: state?.partyWithFiledAsToData,
                        documentData: state?.documentData,
                        editMode: true,
                        returnTo: 'checkout'
                    }
                });
                break;
            case 'parties':
                navigate('/services/jti-filing/add-party', {
                    state: {
                        caseTypeId: state?.caseTypeId,
                        caseData: state?.caseData,
                        parties: state?.partyData, // Pass as "parties" for AddParty page
                        partyData: state?.partyData, // Also keep as partyData for consistency
                        partyWithFiledAsToData: state?.partyWithFiledAsToData,
                        documentData: state?.documentData,
                        editMode: true,
                        returnTo: 'checkout'
                    }
                });
                break;
            case 'filedAsTo':
                navigate('/services/jti-filing/add-party-with-filed-as-to', {
                    state: {
                        caseTypeId: state?.caseTypeId,
                        caseData: state?.caseData,
                        parties: state?.partyData, // Pass as "parties" for AddPartyWithFiledAsTo page
                        filedAsToParties: state?.partyWithFiledAsToData, // Pass as "filedAsToParties" for that page
                        partyData: state?.partyData,
                        partyWithFiledAsToData: state?.partyWithFiledAsToData,
                        documentData: state?.documentData,
                        editMode: true,
                        returnTo: 'checkout'
                    }
                });
                break;
            case 'documents':
                navigate('/services/jti-filing/upload-documents', {
                    state: {
                        caseTypeId: state?.caseTypeId,
                        caseData: state?.caseData,
                        partyData: state?.partyData,
                        partyWithFiledAsToData: state?.partyWithFiledAsToData,
                        documentData: state?.documentData,
                        uploadedFiles: state?.uploadedFiles,
                        editMode: true,
                        returnTo: 'checkout'
                    }
                });
                break;
        }
    };

    const handleBack = () => {
        navigate('/services/jti-filing/upload-documents', {
            state: {
                caseTypeId: state?.caseTypeId,
                caseData: state?.caseData,
                partyData: state?.partyData,
                partyWithFiledAsToData: state?.partyWithFiledAsToData,
                documentData: state?.documentData
            }
        });
    };

    const handleSubmit = async () => {
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }

        try {
            setIsSubmitting(true);

            // Prepare the API payload
            const payload = prepareFilingPayload();

            console.log('Submitting filing payload:', payload);

            // Build the API URL using config
            const apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILING.SUBMIT_CIVIL_FILING(
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

            console.log('Filing submission response:', result);

            // Always show modal for both success and error
            setSubmissionResponse(result);
            setShowSuccessModal(true);

        } catch (error) {
            console.error('Error submitting filing:', error);

            // Create error response for modal
            setSubmissionResponse({
                success: false,
                data: {
                    messageReceiptMessage: {
                        error: [{
                            errorCode: { value: 'NETWORK_ERROR' },
                            errorText: { value: error instanceof Error ? error.message : 'Network error: Unable to connect to the server. Please check your connection and try again.' }
                        }]
                    }
                }
            });
            setShowSuccessModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const prepareFilingPayload = () => {
        const caseData = state.caseData;
        const parties = state.partyData || [];
        const documents = state.documentData || [];

        // Separate parties by role
        const plaintiffs = parties.filter(p => p.role === 'PLAIN' || p.role === 'PETR');
        const defendants = parties.filter(p => p.role === 'DEF' || p.role === 'RESP');

        // Collect all attorneys from all parties
        const allAttorneys: any[] = [];
        parties.forEach((party, index) => {
            if (party.attorneys && party.attorneys.length > 0) {
                party.attorneys.forEach(attorney => {
                    allAttorneys.push({
                        firstName: attorney.firstName,
                        middleName: attorney.middle || '',
                        lastName: attorney.lastName,
                        barNumber: attorney.barNumber,
                        email: attorney.email,
                        phone: party.selfRepPhone || '',
                        representsParticipantIds: [`filedBy${index}`],
                        address: {
                            locationType: 'M',
                            country: party.selfRepCountry || 'US',
                            street: party.selfRepAddress || '',
                            city: party.selfRepCity || '',
                            state: party.selfRepState || '',
                            zipCode: party.selfRepZip || ''
                        }
                    });
                });
            }
        });

        // Prepare payload
        const payload = {
            caseCategoryText: caseData?.selectedCaseCategory?.code || caseData?.caseCategory || '',
            caseTypeText: caseData?.selectedCaseType?.code || caseData?.caseType || '',
            amountInControversy: parseInt(caseData?.demandAmount || '0'),
            jurisdictionalGroundsCode: caseData?.selectedJurisdictionalAmount?.code || caseData?.jurisdictionalAmount || '',
            documentIdentificationId: `DOC${Date.now()}`,
            plaintiffs: plaintiffs.map(p => {
                const plaintiff: any = {
                    role: p.role
                };

                if (p.type === 'P') {
                    // Person
                    plaintiff.firstName = p.firstName;
                    plaintiff.lastName = p.lastName;
                    if (p.middleName) plaintiff.middleName = p.middleName;
                } else {
                    // ✅ Organization - ALWAYS include firstName/lastName
                    plaintiff.firstName = p.firstName || p.name || 'Organization';
                    plaintiff.lastName = p.lastName || p.name || 'Name';
                    plaintiff.organizationName = p.name;
                }

                // Add self-representation details if applicable
                if (p.representingYourself && p.selfRepAddress) {
                    plaintiff.email = p.selfRepEmail;
                    plaintiff.address = {
                        locationType: 'HM',
                        country: p.selfRepCountry || 'US',
                        street: p.selfRepAddress,
                        city: p.selfRepCity,
                        state: p.selfRepState,
                        zipCode: p.selfRepZip
                    };
                }

                return plaintiff;
            }),
            defendants: defendants.map(d => {
                const defendant: any = {
                    role: d.role
                };

                if (d.type === 'P') {
                    // Person
                    defendant.firstName = d.firstName;
                    defendant.lastName = d.lastName;
                    if (d.middleName) defendant.middleName = d.middleName;
                } else {
                    // ✅ Organization - ALWAYS include firstName/lastName
                    defendant.firstName = d.firstName || d.name || 'Organization';
                    defendant.lastName = d.lastName || d.name || 'Name';
                    defendant.organizationName = d.name;
                }

                return defendant;
            }),
            attorneys: allAttorneys,
            court: {
                organizationId: 'Placer County Superior Court',
                sourceText: 'PLA',
                locationCode: 'GIB',
                courtName: 'Placer County Superior Court'
            },
            incidentAddress: {
                zipCode: plaintiffs[0]?.selfRepZip || '93636'
            },
            documents: documents.map((doc, index) => ({
                documentType: doc.isLeadDocument ? 'Lead' : 'Connected',
                binaryUrl: 'https://docs-educore-pro.s3.eu-west-2.amazonaws.com/1_compressed.pdf', //doc.fileName, // You'll need to upload and get actual URL
                descriptionCode: doc.documentCode,
                fileControlId: (2990 + index).toString(),
                identificationId: doc.documentCode,
                sourceText: 'PLA'
            })),
            payment: {
                customerProfileId: '0',
                customerPaymentProfileId: '0',
                paymentType: paymentMethod
            }
        };

        return payload;
    };

    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return 'N/A';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    const getPartyDisplayName = (party: Party | FiledAsToParty): string => {
        // Check if it's organization type
        if ('type' in party && party.type === 'O' && party.name) {
            return party.name;
        }

        // For person type
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

    const getPartyAddress = (party: Party): string => {
        if (!party.representingYourself) return '';

        const addressParts = [
            party.selfRepAddress,
            party.selfRepAddress2,
            `${party.selfRepCity || ''}${party.selfRepState ? ', ' + party.selfRepState : ''} ${party.selfRepZip || ''}`.trim(),
            party.selfRepCountry
        ].filter(part => part && part.trim());

        return addressParts.join('\n');
    };

    if (!hasData) {
        return (
            <div className="min-h-screen bg-gray-50">
                <JTIHeader />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-1">No Filing Data Found</h4>
                                <p className="text-sm text-gray-700 mb-4">
                                    It appears you navigated directly to the checkout page. Please start a new filing.
                                </p>
                                <button
                                    onClick={() => navigate('/services/jti-filing/new-case')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                >
                                    Start New Filing
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
            {/* Header */}
            <JTIHeader />

            {/* Main Content */}
            <main className="pt-24 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Review and Submit Filing</h1>
                        <p className="text-gray-600">
                            Please review all information below before submitting your filing. Click "Edit" to make changes to any section.
                        </p>
                    </div>

                    {/* Case Information Section */}
                    {state?.caseData && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 bg-blue-50 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-base font-bold text-gray-900">Case Information</h2>
                                <button
                                    onClick={() => handleEdit('case')}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-4">
                                <div>
                                    <p className="text-sm text-gray-600">E-Filing Title:</p>
                                    <p className="text-sm text-gray-900 font-normal">{state.caseData.eFilingTitle}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Case Type:</p>
                                    <p className="text-sm text-gray-900 font-normal">
                                        {state.caseData.selectedCaseType?.name || state.caseData.caseType}
                                        {state.caseData.selectedCaseType && (
                                            <span className="text-gray-500 text-xs ml-2">({state.caseData.selectedCaseType.code})</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Case Category:</p>
                                    <p className="text-sm text-gray-900 font-normal">
                                        {state.caseData.selectedCaseCategory?.name || state.caseData.caseCategory}
                                        {state.caseData.selectedCaseCategory && (
                                            <span className="text-gray-500 text-xs ml-2">({state.caseData.selectedCaseCategory.code})</span>
                                        )}
                                    </p>
                                </div>
                                {state.caseData.jurisdictionalAmount && (
                                    <div>
                                        <p className="text-sm text-gray-600">Jurisdictional Amount:</p>
                                        <p className="text-sm text-gray-900 font-normal">
                                            {state.caseData.selectedJurisdictionalAmount?.name || state.caseData.jurisdictionalAmount}
                                            {state.caseData.selectedJurisdictionalAmount && (
                                                <span className="text-gray-500 text-xs ml-2">({state.caseData.selectedJurisdictionalAmount.code})</span>
                                            )}
                                        </p>
                                    </div>
                                )}
                                {state.caseData.demandAmount && (
                                    <div>
                                        <p className="text-sm text-gray-600">Demand Amount:</p>
                                        <p className="text-sm text-gray-900 font-normal">${state.caseData.demandAmount}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Parties Section */}
                    {(() => {
                        console.log('Checking party data for display...');
                        console.log('state?.partyData:', state?.partyData);
                        console.log('Is array?', Array.isArray(state?.partyData));
                        console.log('Length:', state?.partyData?.length);

                        if (!state?.partyData) {
                            console.log('No partyData in state');
                            return null;
                        }

                        if (!Array.isArray(state.partyData)) {
                            console.log('partyData is not an array');
                            return null;
                        }

                        if (state.partyData.length === 0) {
                            console.log('partyData array is empty');
                            return null;
                        }

                        console.log('Rendering Parties section with', state.partyData.length, 'parties');

                        return (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 bg-blue-50 border-b border-gray-200 flex items-center justify-between">
                                    <h2 className="text-base font-bold text-gray-900">Parties</h2>
                                    <button
                                        onClick={() => handleEdit('parties')}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-6">
                                        {state.partyData.map((party, index) => {
                                            console.log(`Rendering party ${index}:`, party);
                                            return (
                                                <div key={party.id || index} className="pb-6 last:pb-0 border-b border-gray-200 last:border-0">
                                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                                        <div>
                                                            <p className="text-sm text-gray-600">Party Role:</p>
                                                            <p className="text-sm text-gray-900 font-normal">{getPartyRole(party.role)}</p>
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

                                                        {/* Show Self-Representation Info */}
                                                        {party.representingYourself && (
                                                            <>
                                                                <div className="col-span-2">
                                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                                                        Self-Represented
                                                                    </span>
                                                                </div>

                                                                {party.selfRepEmail && (
                                                                    <div>
                                                                        <p className="text-sm text-gray-600">Email:</p>
                                                                        <p className="text-sm text-gray-900 font-normal">{party.selfRepEmail}</p>
                                                                    </div>
                                                                )}

                                                                {party.selfRepPhone && (
                                                                    <div>
                                                                        <p className="text-sm text-gray-600">Phone:</p>
                                                                        <p className="text-sm text-gray-900 font-normal">{party.selfRepPhone}</p>
                                                                    </div>
                                                                )}

                                                                {getPartyAddress(party) && (
                                                                    <div className="col-span-2">
                                                                        <p className="text-sm text-gray-600">Address:</p>
                                                                        <p className="text-sm text-gray-900 font-normal whitespace-pre-line">
                                                                            {getPartyAddress(party)}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}

                                                        {/* Show Attorney Info */}
                                                        {party.hasAttorney && party.attorneys && party.attorneys.length > 0 && (
                                                            <div className="col-span-2 mt-2">
                                                                <p className="text-sm text-gray-600 mb-2">Representation:</p>
                                                                <div className="space-y-2">
                                                                    {party.attorneys.map((attorney, attIdx) => (
                                                                        <div key={attorney.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                                                                <div>
                                                                                    <p className="text-xs text-gray-600">Attorney Name:</p>
                                                                                    <p className="text-sm text-gray-900 font-normal">
                                                                                        {attorney.firstName} {attorney.middle} {attorney.lastName} {attorney.suffix}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-xs text-gray-600">Role:</p>
                                                                                    <p className="text-sm text-gray-900 font-normal">{attorney.role}</p>
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
                                                                                {attorney.altEmail && (
                                                                                    <div>
                                                                                        <p className="text-xs text-gray-600">Alt Email:</p>
                                                                                        <p className="text-sm text-gray-900 font-normal">{attorney.altEmail}</p>
                                                                                    </div>
                                                                                )}
                                                                                {attorney.consentToEService && (
                                                                                    <div className="col-span-2">
                                                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                                                                            ✓ Consent to eService
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Filed As To Parties Section */}
                    {state?.partyWithFiledAsToData && state.partyWithFiledAsToData.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 bg-blue-50 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-base font-bold text-gray-900">Filed As To</h2>
                                <button
                                    onClick={() => handleEdit('filedAsTo')}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {state.partyWithFiledAsToData.map((party, index) => (
                                        <div key={party.id || index} className="pb-4 last:pb-0 border-b border-gray-200 last:border-0">
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Party Role:</p>
                                                    <p className="text-sm text-gray-900 font-normal">{getPartyRole(party.role)}</p>
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
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents Section */}
                    {state?.documentData && state.documentData.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 bg-blue-50 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-base font-bold text-gray-900">Documents</h2>
                                <button
                                    onClick={() => handleEdit('documents')}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {state.documentData.map((doc, index) => (
                                        <div key={doc.id} className="flex items-start space-x-3">
                                            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-gray-900 font-normal">{doc.documentType}</p>
                                                    {doc.isLeadDocument && (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                                            Lead
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">Code: {doc.documentCode}</p>
                                                <p className="text-xs text-gray-600 mt-1">{doc.fileName} - {formatFileSize(doc.fileSize)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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

                    {/* Message to Clerk Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-base font-bold text-gray-900">Message to Clerk (Optional)</h2>
                        </div>
                        <div className="p-6">
                            <textarea
                                value={messageToClerk}
                                onChange={(e) => setMessageToClerk(e.target.value)}
                                rows={4}
                                placeholder="Enter any message or notes for the clerk..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none text-sm"
                            />
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
                            className={`px-8 py-2.5 text-white rounded-lg transition font-medium shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${paymentMethod && !isSubmitting
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-gray-400'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Filing'
                            )}
                        </button>
                    </div>
                </div>
            </main>

            {/* Success Modal */}
            // Replace your existing modal code in Checkout.tsx with this:

            {showSuccessModal && submissionResponse && (() => {
                // Check if submission was successful
                const errorText = submissionResponse.data?.messageReceiptMessage?.error?.[0]?.errorText?.value || '';
                const isSuccess = errorText === 'No Error' || errorText === '';
                const errorCode = submissionResponse.data?.messageReceiptMessage?.error?.[0]?.errorCode?.value || '';

                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header - Dynamic based on success/error */}
                            <div className={`px-6 py-4 border-b border-gray-200 ${isSuccess
                                ? 'bg-gradient-to-r from-green-50 to-green-100'
                                : 'bg-gradient-to-r from-red-50 to-red-100'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-600' : 'bg-red-600'
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
                                            {isSuccess ? 'Filing Submitted Successfully!' : 'Filing Submission Failed'}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {isSuccess
                                                ? 'Your case has been filed with the court'
                                                : 'There was an error submitting your filing'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Status Section - Only show on ERROR */}
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

                                {/* Show details only on success */}
                                {isSuccess && (
                                    <>
                                        {/* File Control IDs */}
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

                                        {/* Document Identification */}
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

                                        {/* Document Received Date */}
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

                                        {/* Important Note - Success */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-blue-900">Important</p>
                                                    <p className="text-sm text-blue-800 mt-1">
                                                        Please save your File Control ID for future reference. You will receive a confirmation email with additional details.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Error advice - Only show on error */}
                                {!isSuccess && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-yellow-900">What to do next</p>
                                                <p className="text-sm text-yellow-800 mt-1">
                                                    Please review the error message above and correct any issues. If the problem persists, contact support with the error code.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
                                {isSuccess ? (
                                    <button
                                        onClick={() => {
                                            setShowSuccessModal(false);
                                            navigate('/services/jti-filing/new-case');
                                        }}
                                        className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                                    >
                                        Start New Filing
                                    </button>
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

export default Checkout;