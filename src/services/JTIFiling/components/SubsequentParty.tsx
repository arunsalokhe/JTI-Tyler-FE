import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, X, User, Building2, ArrowLeft, ArrowRight, Mail, Phone, MapPin } from 'lucide-react';
import JTIHeader from './JTIHeader';
import { jtiFilingService } from '../jtiFilingService';
import { ApiError } from '../apiConfig';
import {
    PartyType,
    PartyDesignationType,
    Language,
    Country,
    USState,
    AKAType,
} from '../../../types/jtiFilingTypes';

// Types
interface Party {
    id: string;
    role: string;
    roleDescription?: string;
    partySubtype: {
        guardianAdLitem: boolean;
        incompetentPerson: boolean;
        minor: boolean;
    };
    type: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    suffix?: string;
    name?: string;
    needInterpreter: boolean;
    nativeLanguage?: string;
    filingFeesExemption: boolean;
    feeExemptionType?: string;
    representingYourself: boolean;
    hasAttorney: boolean;
    selfRepCountry?: string;
    selfRepAddress?: string;
    selfRepAddress2?: string;
    selfRepCity?: string;
    selfRepState?: string;
    selfRepZip?: string;
    selfRepEmail?: string;
    selfRepPhone?: string;
    attorneys?: Attorney[];
    isExisting?: boolean;
    participantRefId?: string;
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

const SubsequentParty = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const caseData = location.state;

    // Get case data from navigation state
    const apiParties = caseData?.subsequentFilingData?.rawApiData?.parties || [];
    const apiAttorneys = caseData?.subsequentFilingData?.rawApiData?.attorneys || [];
    const relatedCaseAssignments = caseData?.subsequentFilingData?.rawApiData?.relatedCaseAssignments || [];

    // API Data States
    const [partyRoles, setPartyRoles] = useState<PartyType[]>([]);
    const [partyDesignationTypes, setPartyDesignationTypes] = useState<PartyDesignationType[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [usStates, setUSStates] = useState<USState[]>([]);
    const [akaTypes, setAkaTypes] = useState<AKAType[]>([]);

    // Loading States
    const [loading, setLoading] = useState(true);
    const [loadingPartyRoles, setLoadingPartyRoles] = useState(false);

    const [parties, setParties] = useState<Party[]>([]);
    const [showAttorneyModal, setShowAttorneyModal] = useState(false);
    const [currentPartyId, setCurrentPartyId] = useState<string>('');

    const [attorneyForm, setAttorneyForm] = useState({
        barNumberSearch: '',
        role: 'Attorney',
        type: 'Attorney',
        firm: '',
        barNumber: '',
        firstName: '',
        middle: '',
        lastName: '',
        suffix: '',
        email: '',
        altEmail: '',
        consentToEService: false
    });

    const feeExemptionTypes = [
        { code: 'FW', name: 'Fee Waiver' },
        { code: 'GE', name: 'Government Entity' }
    ];

    // ===== FETCH API DATA ON MOUNT =====
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Fetch party roles when case category is available
    useEffect(() => {
        if (caseData?.caseCategory) {
            fetchPartyRoles(caseData.caseCategory);
        }
    }, [caseData?.caseCategory]);

    // Initialize parties from API data after dropdowns are loaded
    useEffect(() => {
        if (!loading && apiParties.length > 0 && partyDesignationTypes.length > 0) {
            const convertedParties = convertApiPartiesToAppFormat();
            setParties(convertedParties);
            console.log('Loaded existing parties:', convertedParties);
        }
    }, [loading, apiParties, partyDesignationTypes]);

    /**
     * Fetch all initial dropdown data
     */
    const fetchInitialData = async () => {
        try {
            setLoading(true);

            const [
                designationTypes,
                languagesList,
                countriesList,
                statesList,
                akaTypesList
            ] = await Promise.all([
                jtiFilingService.getPartyDesignationTypes(),
                jtiFilingService.getLanguages(),
                jtiFilingService.getCountries(),
                jtiFilingService.getUSStates(),
                jtiFilingService.getAKATypes(),
            ]);

            setPartyDesignationTypes(designationTypes);
            setLanguages(languagesList);
            setCountries(countriesList.filter(c => c.isActive));
            setUSStates(statesList.filter(s => s.isActive));
            setAkaTypes(akaTypesList.filter(t => t.isActive));

            console.log('✅ API data loaded successfully');
        } catch (error) {
            console.error('Error fetching initial data:', error);
            if (error instanceof ApiError) {
                alert(`Error loading form data: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetch party roles based on case category
     */
    const fetchPartyRoles = async (caseCategoryCode: string) => {
        try {
            setLoadingPartyRoles(true);
            const data = await jtiFilingService.getPartyTypes(caseCategoryCode);
            setPartyRoles(data.partyTypes || []);
            console.log('✅ Party roles loaded:', data.partyTypes?.length);
        } catch (error) {
            console.error('Error fetching party roles:', error);
            if (error instanceof ApiError) {
                alert(`Error loading party roles: ${error.message}`);
            }
        } finally {
            setLoadingPartyRoles(false);
        }
    };

    // Convert API parties to app format
    const convertApiPartiesToAppFormat = (): Party[] => {
        return apiParties.map((apiParty: any) => {
            const isOrganization = apiParty.type === 'Organization';

            // Find associated attorneys using relatedCaseAssignments
            const partyAttorneys = apiAttorneys
                .filter((attorney: any) => {
                    return relatedCaseAssignments.some((assignment: any) =>
                        assignment.participantId === apiParty.id &&
                        assignment.attorneyAssignmentId === attorney.assignmentId
                    );
                })
                .map((attorney: any) => {
                    const nameParts = attorney.name.split(' ');
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';

                    return {
                        id: attorney.id,
                        barNumberSearch: attorney.barNumber || '',
                        role: 'Attorney',
                        type: 'Attorney',
                        firm: attorney.organization || '',
                        barNumber: attorney.barNumber || '',
                        firstName: firstName,
                        middle: '',
                        lastName: lastName,
                        suffix: '',
                        email: attorney.contactInfo?.email || '',
                        altEmail: '',
                        consentToEService: false
                    };
                });

            // Parse party name
            const nameParts = apiParty.name.split(' ');
            const firstName = !isOrganization && nameParts.length > 0 ? nameParts[0] : '';
            const lastName = !isOrganization && nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

            return {
                id: apiParty.id,
                participantRefId: apiParty.participantRefId || apiParty.id,
                role: apiParty.role,
                roleDescription: apiParty.roleDescription,
                partySubtype: {
                    guardianAdLitem: false,
                    incompetentPerson: false,
                    minor: false
                },
                type: isOrganization ? 'O' : 'P',
                firstName: firstName,
                middleName: '',
                lastName: lastName,
                suffix: '',
                name: isOrganization ? apiParty.name : '',
                needInterpreter: false,
                filingFeesExemption: false,
                representingYourself: false,
                hasAttorney: partyAttorneys.length > 0,
                selfRepCountry: 'US',
                selfRepAddress: '',
                selfRepAddress2: '',
                selfRepCity: '',
                selfRepState: '',
                selfRepZip: '',
                selfRepEmail: '',
                selfRepPhone: '',
                attorneys: partyAttorneys,
                isExisting: true
            };
        });
    };

    useEffect(() => {
        // Check if we have case data
        if (!caseData || !caseData.caseTrackingId) {
            console.error('No case data found');
            navigate('/services/jti-filing/subsequent-filing');
            return;
        }

        // Initialize parties from API data
        if (apiParties.length > 0) {
            const convertedParties = convertApiPartiesToAppFormat();
            setParties(convertedParties);
            console.log('Loaded existing parties:', convertedParties);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        // Check if we have case data
        if (!caseData || !caseData.caseTrackingId) {
            console.error('No case data found in navigation state');
            console.log('Available location.state:', location.state);
            navigate('/services/jti-filing/subsequent-filing');
            return;
        }

        console.log('SubsequentParty - Received case data:', caseData);

        // Initialize parties from API data
        if (apiParties.length > 0) {
            const convertedParties = convertApiPartiesToAppFormat();
            setParties(convertedParties);
            console.log('Loaded existing parties:', convertedParties);
        } else {
            console.warn('No API parties found');
        }

        setLoading(false);
    }, []);

    const handleAddParty = () => {
        const newParty: Party = {
            id: `new_${Date.now()}`,
            role: partyRoles.length > 0 ? partyRoles[0].code : '',
            partySubtype: {
                guardianAdLitem: false,
                incompetentPerson: false,
                minor: false
            },
            type: partyDesignationTypes.length > 0 ? partyDesignationTypes[0].code : '',
            firstName: '',
            middleName: '',
            lastName: '',
            suffix: '',
            name: '',
            needInterpreter: false,
            filingFeesExemption: false,
            representingYourself: false,
            hasAttorney: false,
            selfRepCountry: 'US',
            selfRepAddress: '',
            selfRepAddress2: '',
            selfRepCity: '',
            selfRepState: '',
            selfRepZip: '',
            selfRepEmail: '',
            selfRepPhone: '',
            attorneys: [],
            isExisting: false
        };
        setParties([...parties, newParty]);
    };

    const handleRemoveParty = (id: string) => {
        const party = parties.find(p => p.id === id);
        if (party?.isExisting) {
            alert('Cannot remove existing parties from the case. You can only remove newly added parties.');
            return;
        }
        setParties(parties.filter(party => party.id !== id));
    };

    const handlePartyChange = (id: string, field: string, value: any) => {
        setParties(parties.map(party => {
            if (party.id === id) {
                // Don't allow editing existing parties' basic info
                if (party.isExisting && ['role', 'type', 'firstName', 'lastName', 'name'].includes(field)) {
                    return party;
                }

                if (field.startsWith('partySubtype.')) {
                    const subtypeField = field.split('.')[1];
                    return {
                        ...party,
                        partySubtype: {
                            ...party.partySubtype,
                            [subtypeField]: value
                        }
                    };
                }

                return { ...party, [field]: value };
            }
            return party;
        }));
    };

    const handleAddAttorney = (partyId: string) => {
        setCurrentPartyId(partyId);
        setShowAttorneyModal(true);
    };

    const handleRemoveAttorney = (partyId: string, attorneyIndex: number) => {
        setParties(parties.map(party => {
            if (party.id === partyId) {
                const updatedAttorneys = party.attorneys?.filter((_, idx) => idx !== attorneyIndex) || [];
                return {
                    ...party,
                    attorneys: updatedAttorneys,
                    hasAttorney: updatedAttorneys.length > 0
                };
            }
            return party;
        }));
    };

    const handleSaveAttorney = () => {
        if (!attorneyForm.firstName || !attorneyForm.lastName || !attorneyForm.email) {
            alert('Please fill in all required attorney fields (First Name, Last Name, Email)');
            return;
        }

        const newAttorney: Attorney = {
            id: `attorney_${Date.now()}`,
            ...attorneyForm
        };

        setParties(parties.map(party => {
            if (party.id === currentPartyId) {
                return {
                    ...party,
                    hasAttorney: true,
                    attorneys: [...(party.attorneys || []), newAttorney]
                };
            }
            return party;
        }));

        setShowAttorneyModal(false);
        setAttorneyForm({
            barNumberSearch: '',
            role: 'Attorney',
            type: 'Attorney',
            firm: '',
            barNumber: '',
            firstName: '',
            middle: '',
            lastName: '',
            suffix: '',
            email: '',
            altEmail: '',
            consentToEService: false
        });
    };

    const handleBack = () => {
        navigate('/services/jti-filing/subsequent-case', { state: caseData });
    };

    const handleContinue = () => {
        // Validate new parties
        const newParties = parties.filter(p => !p.isExisting);

        if (newParties.length > 0) {
            // Check basic info
            for (const party of newParties) {
                if (party.type === 'P') {
                    if (!party.firstName || !party.lastName) {
                        alert('Please fill in First Name and Last Name for all new parties');
                        return;
                    }
                } else {
                    if (!party.name) {
                        alert('Please fill in Organization Name for all new parties');
                        return;
                    }
                }
            }

            // Check representation
            for (const party of newParties) {
                if (!party.representingYourself && !party.hasAttorney) {
                    alert('Each new party must have representation. Please either check "Are You Representing Yourself" and fill contact details, OR add an Attorney.');
                    return;
                }

                if (party.representingYourself) {
                    if (!party.selfRepAddress || !party.selfRepCity || !party.selfRepState ||
                        !party.selfRepZip || !party.selfRepEmail) {
                        alert('Please fill in all required self-representation fields:\n- Address\n- City\n- State\n- Zip\n- Email');
                        return;
                    }
                }
            }
        }

        console.log('✅ All parties validated:', parties);

        // ✅ IMPORTANT: Pass caseData at the root level, not nested
        const nextStepData = {
            caseData: caseData,  // Keep caseData structure intact
            parties: parties,     // Add parties array
            isSubsequentFiling: true
        };

        console.log('✅ Navigating to subsequent documents with state:', nextStepData);

        // Navigate to SubsequentDocument
        navigate('/services/jti-filing/subsequent-documents', {
            state: nextStepData
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading party information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <JTIHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Info Banner */}
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-semibold text-blue-900 mb-1">Subsequent Filing - Party Management</h4>
                            <p className="text-sm text-blue-800">
                                The parties below are already associated with case <strong>{caseData?.caseTrackingId}</strong>.
                                Their basic information cannot be modified. You can add additional parties using the "Add Another Party" button.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Case Info Summary */}
                <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-gray-500">Case Title</p>
                            <p className="text-sm font-semibold text-gray-900">{caseData?.eFilingTitle || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Case Docket ID</p>
                            <p className="text-sm font-semibold text-gray-900">{caseData?.caseDocketId || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Case Type</p>
                            <p className="text-sm font-semibold text-gray-900">{caseData?.selectedCaseType?.name || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Parties List */}
                <div className="space-y-6">
                    {parties.map((party, index) => (
                        <div key={party.id} className={`bg-white rounded-xl shadow-sm border-2 ${party.isExisting ? 'border-blue-200' : 'border-gray-200'}`}>
                            {/* Party Header */}
                            <div className={`${party.isExisting ? 'bg-gradient-to-r from-blue-50 to-cyan-50' : 'bg-gradient-to-r from-indigo-50 to-blue-50'} px-6 py-4 border-b ${party.isExisting ? 'border-blue-200' : 'border-gray-200'} flex items-center justify-between`}>
                                <div className="flex items-center gap-3">
                                    {party.isExisting && (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Existing Party
                                        </div>
                                    )}
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Party #{index + 1}
                                    </h2>
                                    {party.type === 'P' ? (
                                        <User className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <Building2 className="w-5 h-5 text-gray-500" />
                                    )}
                                </div>
                                {!party.isExisting && (
                                    <button
                                        onClick={() => handleRemoveParty(party.id)}
                                        className="p-2 hover:bg-white rounded-lg transition text-red-600"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Role */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-900">
                                        Role<span className="text-red-500">*</span>
                                    </label>
                                    {party.isExisting ? (
                                        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium">
                                            {party.roleDescription || party.role}
                                        </div>
                                    ) : (
                                        <select
                                            value={party.role}
                                            onChange={(e) => handlePartyChange(party.id, 'role', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            {partyRoles.map((role) => (
                                                <option key={role.code} value={role.code}>{role.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Party Sub-type - ONLY SHOW FOR NEW PARTIES */}
                                {!party.isExisting && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-900">Party Sub-type</label>
                                        <div className="flex flex-wrap gap-6">
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={party.partySubtype.guardianAdLitem}
                                                    onChange={(e) => handlePartyChange(party.id, 'partySubtype.guardianAdLitem', e.target.checked)}
                                                    className="w-4 h-4 text-indigo-600 rounded"
                                                />
                                                <span className="text-sm text-gray-700">Guardian Ad Litem</span>
                                            </label>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={party.partySubtype.incompetentPerson}
                                                    onChange={(e) => handlePartyChange(party.id, 'partySubtype.incompetentPerson', e.target.checked)}
                                                    className="w-4 h-4 text-indigo-600 rounded"
                                                />
                                                <span className="text-sm text-gray-700">Incompetent Person</span>
                                            </label>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={party.partySubtype.minor}
                                                    onChange={(e) => handlePartyChange(party.id, 'partySubtype.minor', e.target.checked)}
                                                    className="w-4 h-4 text-indigo-600 rounded"
                                                />
                                                <span className="text-sm text-gray-700">Minor</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Type */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-900">
                                        Type<span className="text-red-500">*</span>
                                    </label>
                                    {party.isExisting ? (
                                        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium">
                                            {party.type === 'P' ? 'Person' : 'Organization'}
                                        </div>
                                    ) : (
                                        <select
                                            value={party.type}
                                            onChange={(e) => handlePartyChange(party.id, 'type', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            {partyDesignationTypes.map((type) => (
                                                <option key={type.code} value={type.code}>{type.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Name Fields */}
                                {party.type === 'P' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-900">
                                                First Name<span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={party.firstName || ''}
                                                onChange={(e) => handlePartyChange(party.id, 'firstName', e.target.value)}
                                                disabled={party.isExisting}
                                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${party.isExisting ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-900">
                                                Last Name<span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={party.lastName || ''}
                                                onChange={(e) => handlePartyChange(party.id, 'lastName', e.target.value)}
                                                disabled={party.isExisting}
                                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${party.isExisting ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-900">
                                            Organization Name<span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={party.name || ''}
                                            onChange={(e) => handlePartyChange(party.id, 'name', e.target.value)}
                                            disabled={party.isExisting}
                                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${party.isExisting ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                        />
                                    </div>
                                )}

                                {/* Additional Options - ONLY SHOW FOR NEW PARTIES */}
                                {!party.isExisting && (
                                    <div className="space-y-4">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={party.needInterpreter}
                                                onChange={(e) => handlePartyChange(party.id, 'needInterpreter', e.target.checked)}
                                                className="w-4 h-4 text-indigo-600 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Need Interpreter</span>
                                        </label>

                                        {party.needInterpreter && (
                                            <select
                                                value={party.nativeLanguage || ''}
                                                onChange={(e) => handlePartyChange(party.id, 'nativeLanguage', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                <option value="">Select language</option>
                                                {languages.map((lang) => (
                                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                                ))}
                                            </select>
                                        )}

                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={party.filingFeesExemption}
                                                onChange={(e) => handlePartyChange(party.id, 'filingFeesExemption', e.target.checked)}
                                                className="w-4 h-4 text-indigo-600 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Filing Fees Exemption</span>
                                        </label>

                                        {party.filingFeesExemption && (
                                            <select
                                                value={party.feeExemptionType || ''}
                                                onChange={(e) => handlePartyChange(party.id, 'feeExemptionType', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                <option value="">Select exemption type</option>
                                                {feeExemptionTypes.map((type) => (
                                                    <option key={type.code} value={type.code}>{type.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )}

                                {/* Representation Section - Only for new parties */}
                                {!party.isExisting && (
                                    <div className="border-t border-gray-200 pt-6 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Representation</h3>

                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={party.representingYourself}
                                                onChange={(e) => handlePartyChange(party.id, 'representingYourself', e.target.checked)}
                                                className="w-4 h-4 text-indigo-600 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Are You Representing Yourself on this Case?</span>
                                        </label>

                                        {party.representingYourself && (
                                            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                                                {/* Self-representation fields */}
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-900">
                                                        Address<span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={party.selfRepAddress || ''}
                                                        onChange={(e) => handlePartyChange(party.id, 'selfRepAddress', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-semibold text-gray-900">
                                                            City<span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={party.selfRepCity || ''}
                                                            onChange={(e) => handlePartyChange(party.id, 'selfRepCity', e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-semibold text-gray-900">
                                                            State<span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            value={party.selfRepState || ''}
                                                            onChange={(e) => handlePartyChange(party.id, 'selfRepState', e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        >
                                                            {usStates.map((state) => (
                                                                <option key={state.code} value={state.code}>{state.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-semibold text-gray-900">
                                                            Zip<span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={party.selfRepZip || ''}
                                                            onChange={(e) => handlePartyChange(party.id, 'selfRepZip', e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-semibold text-gray-900">
                                                            Email<span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={party.selfRepEmail || ''}
                                                            onChange={(e) => handlePartyChange(party.id, 'selfRepEmail', e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-semibold text-gray-900">
                                                            Phone
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            value={party.selfRepPhone || ''}
                                                            onChange={(e) => handlePartyChange(party.id, 'selfRepPhone', e.target.value)}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Attorneys Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-semibold text-gray-900">Attorneys</h4>
                                                <button
                                                    onClick={() => handleAddAttorney(party.id)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Attorney
                                                </button>
                                            </div>

                                            {party.attorneys && party.attorneys.length > 0 && (
                                                <div className="space-y-3">
                                                    {party.attorneys.map((attorney, idx) => (
                                                        <div key={attorney.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <User className="w-4 h-4 text-gray-500" />
                                                                        <p className="font-semibold text-gray-900">
                                                                            {attorney.firstName} {attorney.lastName}
                                                                        </p>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                                        {attorney.firm && (
                                                                            <div className="flex items-center gap-2">
                                                                                <Building2 className="w-4 h-4" />
                                                                                <span>{attorney.firm}</span>
                                                                            </div>
                                                                        )}
                                                                        {attorney.barNumber && (
                                                                            <div>
                                                                                <span className="font-medium">Bar #:</span> {attorney.barNumber}
                                                                            </div>
                                                                        )}
                                                                        {attorney.email && (
                                                                            <div className="flex items-center gap-2">
                                                                                <Mail className="w-4 h-4" />
                                                                                <span>{attorney.email}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemoveAttorney(party.id, idx)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {!party.representingYourself && (!party.attorneys || party.attorneys.length === 0) && (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                    <p className="text-sm text-yellow-800">
                                                        <strong>Representation Required:</strong> Please either check "Are You Representing Yourself" or add an Attorney.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Show existing attorneys for existing parties */}
                                {party.isExisting && party.attorneys && party.attorneys.length > 0 && (
                                    <div className="border-t border-gray-200 pt-6 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Associated Attorneys</h3>
                                        <div className="space-y-3">
                                            {party.attorneys.map((attorney) => (
                                                <div key={attorney.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <User className="w-4 h-4 text-blue-600" />
                                                        <p className="font-semibold text-gray-900">
                                                            {attorney.firstName} {attorney.lastName}
                                                        </p>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                        {attorney.firm && (
                                                            <div className="flex items-center gap-2">
                                                                <Building2 className="w-4 h-4" />
                                                                <span>{attorney.firm}</span>
                                                            </div>
                                                        )}
                                                        {attorney.barNumber && (
                                                            <div>
                                                                <span className="font-medium">Bar #:</span> {attorney.barNumber}
                                                            </div>
                                                        )}
                                                        {attorney.email && (
                                                            <div className="flex items-center gap-2">
                                                                <Mail className="w-4 h-4" />
                                                                <span>{attorney.email}</span>
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
                    ))}
                </div>

                {/* Add Another Party Button */}
                <div className="mt-6">
                    <button
                        onClick={handleAddParty}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium text-indigo-600 bg-white border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Add Another Party
                    </button>
                </div>

                {/* Navigation Buttons */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <button
                        onClick={handleContinue}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </main>

            {/* Attorney Modal */}
            {showAttorneyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Add Attorney</h3>
                            <button
                                onClick={() => setShowAttorneyModal(false)}
                                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    Please enter the attorney's information. All fields marked with <span className="text-red-500">*</span> are required.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-900">
                                        Bar Number Search
                                    </label>
                                    <input
                                        type="text"
                                        value={attorneyForm.barNumberSearch}
                                        onChange={(e) => setAttorneyForm({ ...attorneyForm, barNumberSearch: e.target.value })}
                                        placeholder="Search by bar number"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-900">
                                        Firm/Organization
                                    </label>
                                    <input
                                        type="text"
                                        value={attorneyForm.firm}
                                        onChange={(e) => setAttorneyForm({ ...attorneyForm, firm: e.target.value })}
                                        placeholder="Enter firm or organization name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-900">
                                            First Name<span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={attorneyForm.firstName}
                                            onChange={(e) => setAttorneyForm({ ...attorneyForm, firstName: e.target.value })}
                                            placeholder="Enter first name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-900">
                                            Last Name<span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={attorneyForm.lastName}
                                            onChange={(e) => setAttorneyForm({ ...attorneyForm, lastName: e.target.value })}
                                            placeholder="Enter last name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-900">
                                        Bar Number
                                    </label>
                                    <input
                                        type="text"
                                        value={attorneyForm.barNumber}
                                        onChange={(e) => setAttorneyForm({ ...attorneyForm, barNumber: e.target.value })}
                                        placeholder="Enter bar number"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-900">
                                        Email<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={attorneyForm.email}
                                        onChange={(e) => setAttorneyForm({ ...attorneyForm, email: e.target.value })}
                                        placeholder="Enter email address"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-900">
                                        Alternate Email
                                    </label>
                                    <input
                                        type="email"
                                        value={attorneyForm.altEmail}
                                        onChange={(e) => setAttorneyForm({ ...attorneyForm, altEmail: e.target.value })}
                                        placeholder="Enter alternate email (optional)"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={attorneyForm.consentToEService}
                                        onChange={(e) => setAttorneyForm({ ...attorneyForm, consentToEService: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Consent to E-Service</span>
                                </label>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowAttorneyModal(false)}
                                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAttorney}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                            >
                                Add Attorney
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubsequentParty;