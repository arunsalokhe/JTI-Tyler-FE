import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, X } from 'lucide-react';
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

interface Party {
  id: string;
  role: string;
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
  // ADD THIS: Array to store attorneys
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

const AddParty: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const caseData = location.state?.caseData;
  const savedParties = location.state?.parties;

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

  // Initialize parties with saved data or default
  const [parties, setParties] = useState<Party[]>(savedParties || [
    {
      id: '1',
      role: '',
      partySubtype: {
        guardianAdLitem: false,
        incompetentPerson: false,
        minor: false
      },
      type: '',
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
      attorneys: [] // ADD THIS
    }
  ]);

  // Modal states
  const [showAttorneyModal, setShowAttorneyModal] = useState(false);
  const [showAKAModal, setShowAKAModal] = useState(false);
  const [currentPartyId, setCurrentPartyId] = useState<string>('');
  const [akaPartyType, setAkaPartyType] = useState<string>('P'); // P or O

  // Attorney form state
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

  // AKA form state
  const [akaForm, setAkaForm] = useState({
    partyDesignationType: 'P',
    type: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    organizationName: ''
  });

  const feeExemptionTypes = [
    { code: 'FW', name: 'Fee Waiver' },
    { code: 'GE', name: 'Government Entity' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch party roles when case category changes
  useEffect(() => {
    if (caseData?.caseCategory) {
      fetchPartyRoles(caseData.caseCategory);
    }
  }, [caseData?.caseCategory]);

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

      // Set first party role if available
      if (data.partyTypes && data.partyTypes.length > 0 && parties.length > 0) {
        handlePartyChange(parties[0].id, 'role', data.partyTypes[0].code);
      }
    } catch (error) {
      console.error('Error fetching party roles:', error);
      if (error instanceof ApiError) {
        alert(`Error loading party roles: ${error.message}`);
      }
    } finally {
      setLoadingPartyRoles(false);
    }
  };

  const handleAddParty = () => {
    const newParty: Party = {
      id: Date.now().toString(),
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
      attorneys: []
    };
    setParties([...parties, newParty]);
  };

  const handleRemoveParty = (id: string) => {
    if (parties.length > 1) {
      setParties(parties.filter(party => party.id !== id));
    }
  };

  const handlePartyChange = (id: string, field: string, value: any) => {
    setParties(parties.map(party => {
      if (party.id === id) {
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

        // ✅ ADD THIS: Auto-populate firstName/lastName for organizations
        if (field === 'name' && party.type !== 'P') {
          return {
            ...party,
            name: value,
            firstName: value,  // ← Auto-set
            lastName: value    // ← Auto-set
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

  const handleAddAKA = (partyId: string) => {
    setCurrentPartyId(partyId);
    const party = parties.find(p => p.id === partyId);
    setAkaPartyType(party?.type || 'P');
    setAkaForm({
      ...akaForm,
      partyDesignationType: party?.type || 'P'
    });
    setShowAKAModal(true);
  };

  const handleCloseAttorneyModal = () => {
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

  const handleCloseAKAModal = () => {
    setShowAKAModal(false);
    setAkaForm({
      partyDesignationType: 'P',
      type: '',
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      organizationName: ''
    });
  };

  const handleSaveAttorney = () => {
    if (!attorneyForm.firstName || !attorneyForm.lastName || !attorneyForm.email) {
      alert('Please fill in all required fields');
      return;
    }

    // Create attorney object with unique ID
    const newAttorney: Attorney = {
      id: `attorney_${Date.now()}`,
      ...attorneyForm
    };

    // Add attorney to the party's attorneys array
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

    console.log('Saving attorney:', newAttorney);
    handleCloseAttorneyModal();
    alert('Attorney added successfully!');
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

  const handleSaveAKA = () => {
    if (akaPartyType === 'P') {
      if (!akaForm.firstName || !akaForm.lastName) {
        alert('Please fill in all required fields');
        return;
      }
    } else {
      if (!akaForm.organizationName) {
        alert('Please fill in organization name');
        return;
      }
    }
    console.log('Saving AKA/DBA:', akaForm);
    handleCloseAKAModal();
    alert('AKA/DBA added successfully!');
  };

  const handleBack = () => {
    // Navigate back to NewCase page with current party data
    navigate('/services/jti-filing/new-case', {
      state: {
        caseData,
        parties // Save current party data
      }
    });
  };

  const handleContinue = () => {
    // Validate basic party information
    const hasBasicInfo = parties.every(party => {
      if (party.type === 'P') {
        return party.firstName && party.lastName;
      } else {
        // For organization, check if name is filled (firstName/lastName are auto-populated)
        return party.name || (party.firstName && party.lastName);
      }
    });

    if (!hasBasicInfo) {
      alert('Please fill in all required fields for all parties');
      return;
    }

    // Validate representation requirement - either self-representing OR has attorney
    const hasRepresentation = parties.every(party =>
      party.representingYourself || party.hasAttorney
    );

    if (!hasRepresentation) {
      alert('Each party must have representation.\n\nPlease either:\n- Check "Are You Representing Yourself on this Case?" and fill in contact details, OR\n- Add an Attorney');
      return;
    }

    // Validate self-representation required fields
    for (const party of parties) {
      if (party.representingYourself) {
        if (!party.selfRepAddress || !party.selfRepCity || !party.selfRepState ||
          !party.selfRepZip || !party.selfRepEmail) {
          alert('Please fill in all required fields for self-representation:\n- Address\n- City\n- State\n- Zip\n- Email');
          return;
        }
      }
    }

    console.log('Parties data:', parties);
    console.log('Case data from previous page:', caseData);

    navigate('/services/jti-filing/add-PartyWithFiledAsTo', {
      state: {
        caseData,
        parties
      }
    });
  };

  // Check if party needs representation
  const needsRepresentation = (party: Party) => {
    return !party.representingYourself && !party.hasAttorney;
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
      {/* Header */}
      <JTIHeader />

      {/* Main Content - Party Forms */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {parties.map((party, index) => (
            <div key={party.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Party Header */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Filed By Party #{index + 1}
                </h2>
                {parties.length > 1 && (
                  <button
                    onClick={() => handleRemoveParty(party.id)}
                    className="p-2 hover:bg-white rounded-lg transition text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Role */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Role<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={party.role}
                    onChange={(e) => handlePartyChange(party.id, 'role', e.target.value)}
                    disabled={loadingPartyRoles}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white disabled:bg-gray-100"
                  >
                    {loadingPartyRoles ? (
                      <option>Loading roles...</option>
                    ) : partyRoles.length === 0 ? (
                      <option>No roles available</option>
                    ) : (
                      <>
                        <option value="">Select role</option>
                        {partyRoles.map((role) => (
                          <option key={role.code} value={role.code}>
                            {role.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                {/* Party Sub-type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Party Sub-type
                  </label>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={party.partySubtype.guardianAdLitem}
                        onChange={(e) => handlePartyChange(party.id, 'partySubtype.guardianAdLitem', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Guardian Ad Litem</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={party.partySubtype.incompetentPerson}
                        onChange={(e) => handlePartyChange(party.id, 'partySubtype.incompetentPerson', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Incompetent Person</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={party.partySubtype.minor}
                        onChange={(e) => handlePartyChange(party.id, 'partySubtype.minor', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Minor</span>
                    </label>
                  </div>
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Type<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={party.type}
                    onChange={(e) => handlePartyChange(party.id, 'type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="">Select type</option>
                    {partyDesignationTypes.map((type) => (
                      <option key={type.code} value={type.code}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conditional Fields based on Type */}
                {party.type === 'P' ? (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900">
                        First Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={party.firstName || ''}
                        onChange={(e) => handlePartyChange(party.id, 'firstName', e.target.value)}
                        placeholder="Enter first name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        value={party.middleName || ''}
                        onChange={(e) => handlePartyChange(party.id, 'middleName', e.target.value)}
                        placeholder="Enter middle name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
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
                        placeholder="Enter last name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900">
                        Suffix
                      </label>
                      <input
                        type="text"
                        value={party.suffix || ''}
                        onChange={(e) => handlePartyChange(party.id, 'suffix', e.target.value)}
                        placeholder="Enter suffix (e.g., Jr., Sr., III)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900">
                        Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={party.name || ''}
                        onChange={(e) => handlePartyChange(party.id, 'name', e.target.value)}
                        placeholder="Enter organization or single name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </>
                )}

                {/* Common Checkboxes with Conditional Fields */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  {/* Do you need an interpreter? */}
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={party.needInterpreter}
                        onChange={(e) => handlePartyChange(party.id, 'needInterpreter', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Do you need an interpreter?</span>
                    </label>

                    {party.needInterpreter && (
                      <div className="ml-6 space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">
                          Native Language<span className="text-red-500">*</span>
                        </label>
                        <select
                          value={party.nativeLanguage || ''}
                          onChange={(e) => handlePartyChange(party.id, 'nativeLanguage', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                        >
                          <option value="">Select language</option>
                          {languages.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                              {lang.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Are You Requesting a Filing Fees Exemption? */}
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={party.filingFeesExemption}
                        onChange={(e) => handlePartyChange(party.id, 'filingFeesExemption', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Are You Requesting a Filing Fees Exemption?</span>
                    </label>

                    {party.filingFeesExemption && (
                      <div className="ml-6 space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">
                          Fee Exemption Type<span className="text-red-500">*</span>
                        </label>
                        <select
                          value={party.feeExemptionType || ''}
                          onChange={(e) => handlePartyChange(party.id, 'feeExemptionType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                        >
                          <option value="">Select fee exemption type</option>
                          {feeExemptionTypes.map((type) => (
                            <option key={type.code} value={type.code}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Are You Representing Yourself - with validation message */}
                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={party.representingYourself}
                          onChange={(e) => handlePartyChange(party.id, 'representingYourself', e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Are You Representing Yourself on this Case?</span>
                      </label>
                      {needsRepresentation(party) && (
                        <p className="text-sm text-red-600 mt-1">
                          Some form of representation is required
                        </p>
                      )}
                    </div>

                    {party.representingYourself && (
                      <div className="ml-6 space-y-6">
                        {/* Address Section */}
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-900">Address #1</h4>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">
                              Country<span className="text-red-500">*</span>
                            </label>
                            <select
                              value={party.selfRepCountry || 'US'}
                              onChange={(e) => handlePartyChange(party.id, 'selfRepCountry', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                            >
                              {countries.map((country) => (
                                <option key={country.code} value={country.code}>
                                  {country.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">
                              Address 1<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={party.selfRepAddress || ''}
                              onChange={(e) => handlePartyChange(party.id, 'selfRepAddress', e.target.value)}
                              placeholder="Street address"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">
                              Address 2
                            </label>
                            <input
                              type="text"
                              value={party.selfRepAddress2 || ''}
                              onChange={(e) => handlePartyChange(party.id, 'selfRepAddress2', e.target.value)}
                              placeholder="Apartment, suite, etc."
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">
                              City<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={party.selfRepCity || ''}
                              onChange={(e) => handlePartyChange(party.id, 'selfRepCity', e.target.value)}
                              placeholder="City"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">
                              State<span className="text-red-500">*</span>
                            </label>
                            <select
                              value={party.selfRepState || ''}
                              onChange={(e) => handlePartyChange(party.id, 'selfRepState', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                            >
                              <option value="">Select state</option>
                              {usStates.map((state) => (
                                <option key={state.code} value={state.code}>
                                  {state.name}
                                </option>
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
                              placeholder="ZIP code"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                        </div>

                        {/* Phone Section */}
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-900">Phone #1</h4>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">
                              Number
                            </label>
                            <input
                              type="tel"
                              placeholder="Phone number"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">
                              Extension
                            </label>
                            <input
                              type="text"
                              placeholder="Extension"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                        </div>

                        {/* Email Section */}
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-900">Email #1</h4>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">
                              Type
                            </label>
                            <select
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                            >
                              <option value="primary">Primary</option>
                              <option value="secondary">Secondary</option>
                              <option value="work">Work</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">
                              Email<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              value={party.selfRepEmail || ''}
                              onChange={(e) => handlePartyChange(party.id, 'selfRepEmail', e.target.value)}
                              placeholder="Email address"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                        </div>

                        {/* Consent to eService */}
                        <div className="space-y-2">
                          <label className="flex items-start space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-semibold text-gray-900">Consent to eService</span>
                              <p className="text-xs text-gray-600 mt-1">
                                On behalf of myself/my client I consent to receiving electronic service from the Court
                                (This is not indicating consent to electronic service from other parties on the case.)
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons with status indicator */}
                <div className="space-y-3 pt-4">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleAddAttorney(party.id)}
                      className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Attorney
                    </button>

                    <button
                      onClick={() => handleAddAKA(party.id)}
                      className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add AKA/DBA
                    </button>
                  </div>

                  {/* Status indicator */}
                  {party.attorneys && party.attorneys.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-gray-900">Added Attorneys ({party.attorneys.length}):</p>
                      {party.attorneys.map((attorney, idx) => (
                        <div key={attorney.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {attorney.firstName} {attorney.middle && `${attorney.middle} `}{attorney.lastName} {attorney.suffix}
                            </p>
                            <p className="text-xs text-gray-600">
                              {attorney.role} {attorney.firm && `• ${attorney.firm}`} • Bar: {attorney.barNumber}
                            </p>
                            <p className="text-xs text-gray-600">{attorney.email}</p>
                            {attorney.consentToEService && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                ✓ Consent to eService
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveAttorney(party.id, idx)}
                            className="ml-3 text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add Another Party, Back & Continue Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <button
                onClick={handleAddParty}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Another Party
              </button>
            </div>

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
      </main>

      {/* Add Attorney Modal */}
      {showAttorneyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Add Representation #1</h3>
              <button onClick={handleCloseAttorneyModal} className="p-1 hover:bg-white rounded transition">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Bar Number Search</label>
                <div className="flex gap-2">
                  <input type="text" value={attorneyForm.barNumberSearch} onChange={(e) => setAttorneyForm({ ...attorneyForm, barNumberSearch: e.target.value })} placeholder="Enter bar number" className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium">Search</button>
                </div>
                <p className="text-xs text-gray-500">Please enter at least 4 digits for bar number search</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Role<span className="text-red-500">*</span></label>
                <select value={attorneyForm.role} onChange={(e) => setAttorneyForm({ ...attorneyForm, role: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="Attorney">Attorney</option>
                  <option value="Co-Counsel">Co-Counsel</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Type<span className="text-red-500">*</span></label>
                <select value={attorneyForm.type} onChange={(e) => setAttorneyForm({ ...attorneyForm, type: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="Attorney">Attorney</option>
                  <option value="Pro Se">Pro Se</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Firm</label>
                <input type="text" value={attorneyForm.firm} onChange={(e) => setAttorneyForm({ ...attorneyForm, firm: e.target.value })} placeholder="Enter firm name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Bar Number<span className="text-red-500">*</span></label>
                <input type="text" value={attorneyForm.barNumber} onChange={(e) => setAttorneyForm({ ...attorneyForm, barNumber: e.target.value })} placeholder="Enter bar number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">First Name<span className="text-red-500">*</span></label>
                <input type="text" value={attorneyForm.firstName} onChange={(e) => setAttorneyForm({ ...attorneyForm, firstName: e.target.value })} placeholder="Enter first name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Middle</label>
                <input type="text" value={attorneyForm.middle} onChange={(e) => setAttorneyForm({ ...attorneyForm, middle: e.target.value })} placeholder="Enter middle name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Last Name<span className="text-red-500">*</span></label>
                <input type="text" value={attorneyForm.lastName} onChange={(e) => setAttorneyForm({ ...attorneyForm, lastName: e.target.value })} placeholder="Enter last name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Suffix</label>
                <input type="text" value={attorneyForm.suffix} onChange={(e) => setAttorneyForm({ ...attorneyForm, suffix: e.target.value })} placeholder="Enter suffix" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Email<span className="text-red-500">*</span></label>
                <input type="email" value={attorneyForm.email} onChange={(e) => setAttorneyForm({ ...attorneyForm, email: e.target.value })} placeholder="Enter email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Alt Email</label>
                <input type="email" value={attorneyForm.altEmail} onChange={(e) => setAttorneyForm({ ...attorneyForm, altEmail: e.target.value })} placeholder="Enter alternate email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <label className="flex items-start space-x-2 cursor-pointer">
                <input type="checkbox" checked={attorneyForm.consentToEService} onChange={(e) => setAttorneyForm({ ...attorneyForm, consentToEService: e.target.checked })} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1" />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900">Consent to eService</span>
                  <p className="text-xs text-gray-600 mt-1">On behalf of myself/my client I consent to receiving electronic service from the Court (This is not indicating consent to electronic service from other parties on the case.)</p>
                </div>
              </label>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
              <button onClick={handleSaveAttorney} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">Save</button>
              <button onClick={handleCloseAttorneyModal} className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add AKA/DBA Modal */}
      {showAKAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">AKA / DBA #1</h3>
              <button onClick={handleCloseAKAModal} className="p-1 hover:bg-white rounded transition">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Party Designation Type</label>
                <select
                  value={akaForm.partyDesignationType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setAkaPartyType(newType);
                    setAkaForm({ ...akaForm, partyDesignationType: newType });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  {partyDesignationTypes.map((type) => (
                    <option key={type.code} value={type.code}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Type<span className="text-red-500">*</span></label>
                <select
                  value={akaForm.type}
                  onChange={(e) => setAkaForm({ ...akaForm, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">Select AKA type</option>
                  {akaTypes.map((type) => (
                    <option key={type.code} value={type.code}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              {akaPartyType === 'P' ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">First Name<span className="text-red-500">*</span></label>
                    <input type="text" value={akaForm.firstName} onChange={(e) => setAkaForm({ ...akaForm, firstName: e.target.value })} placeholder="Enter first name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">Middle Name</label>
                    <input type="text" value={akaForm.middleName} onChange={(e) => setAkaForm({ ...akaForm, middleName: e.target.value })} placeholder="Enter middle name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">Last Name<span className="text-red-500">*</span></label>
                    <input type="text" value={akaForm.lastName} onChange={(e) => setAkaForm({ ...akaForm, lastName: e.target.value })} placeholder="Enter last name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">Suffix</label>
                    <input type="text" value={akaForm.suffix} onChange={(e) => setAkaForm({ ...akaForm, suffix: e.target.value })} placeholder="Enter suffix (e.g., Jr., Sr., III)" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">Organization Name<span className="text-red-500">*</span></label>
                    <input type="text" value={akaForm.organizationName} onChange={(e) => setAkaForm({ ...akaForm, organizationName: e.target.value })} placeholder="Enter organization name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </>
              )}
            </div>
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
              <button onClick={handleSaveAKA} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">Save</button>
              <button onClick={handleCloseAKAModal} className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddParty;