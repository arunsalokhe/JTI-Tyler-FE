import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import JTIHeader from './JTIHeader';
import { jtiFilingService } from '../jtiFilingService';
import { ApiError } from '../apiConfig';
import {
  PartyType,
  PartyDesignationType,
  AKAType,
} from '../../../types/jtiFilingTypes';

interface FiledAsToParty {
  id: string;
  role: string;
  partySubtype: {
    guardianAdLitem: boolean;
    incompetentPerson: boolean;
    minor: boolean;
  };
  type: string; // Will store the code (P or O)
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  name?: string;
}

const AddPartyWithFiledAsTo: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from previous pages
  const caseData = location.state?.caseData;
  const parties = location.state?.parties;
  const savedFiledAsToParties = location.state?.filedAsToParties;

  // API Data States
  const [partyRoles, setPartyRoles] = useState<PartyType[]>([]);
  const [partyDesignationTypes, setPartyDesignationTypes] = useState<PartyDesignationType[]>([]);
  const [akaTypes, setAkaTypes] = useState<AKAType[]>([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [loadingPartyRoles, setLoadingPartyRoles] = useState(false);

  // Filed As To Parties (Defendants/Respondents) - Initialize with saved data or default
  const [filedAsToParties, setFiledAsToParties] = useState<FiledAsToParty[]>(
    savedFiledAsToParties || [
      {
        id: '1',
        role: '',
        partySubtype: {
          guardianAdLitem: false,
          incompetentPerson: false,
          minor: false,
        },
        type: '',
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
        name: '',
      },
    ]
  );

  // Modal states
  const [showAKAModal, setShowAKAModal] = useState(false);
  const [currentPartyId, setCurrentPartyId] = useState<string>('');
  const [akaPartyType, setAkaPartyType] = useState<string>('P');

  // AKA form state
  const [akaForm, setAkaForm] = useState({
    partyDesignationType: 'P',
    type: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    organizationName: '',
  });

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

      const [designationTypes, akaTypesList] = await Promise.all([
        jtiFilingService.getPartyDesignationTypes(),
        jtiFilingService.getAKATypes(),
      ]);

      setPartyDesignationTypes(designationTypes);
      setAkaTypes(akaTypesList.filter((t) => t.isActive));
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
      if (
        data.partyTypes &&
        data.partyTypes.length > 0 &&
        filedAsToParties.length > 0 &&
        !filedAsToParties[0].role
      ) {
        handleFiledAsToPartyChange(
          filedAsToParties[0].id,
          'role',
          data.partyTypes[0].code
        );
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

  // Filed As To Party Handlers
  const handleAddFiledAsToParty = () => {
    const newParty: FiledAsToParty = {
      id: Date.now().toString(),
      role: partyRoles.length > 0 ? partyRoles[0].code : '',
      partySubtype: {
        guardianAdLitem: false,
        incompetentPerson: false,
        minor: false,
      },
      type: partyDesignationTypes.length > 0 ? partyDesignationTypes[0].code : '',
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      name: '',
    };
    setFiledAsToParties([...filedAsToParties, newParty]);
  };

  const handleRemoveFiledAsToParty = (id: string) => {
    if (filedAsToParties.length > 1) {
      setFiledAsToParties(filedAsToParties.filter((party) => party.id !== id));
    }
  };

  const handleFiledAsToPartyChange = (id: string, field: string, value: any) => {
    setFiledAsToParties(
      filedAsToParties.map((party) => {
        if (party.id === id) {
          if (field.startsWith('partySubtype.')) {
            const subtypeField = field.split('.')[1];
            return {
              ...party,
              partySubtype: {
                ...party.partySubtype,
                [subtypeField]: value,
              },
            };
          }

          // ✅ NEW: Special handling for organization name
          if (field === 'name' && party.type !== 'P') {
            return {
              ...party,
              [field]: value,
              firstName: value, // Auto-populate firstName
              lastName: value   // Auto-populate lastName
            };
          }

          return { ...party, [field]: value };
        }
        return party;
      })
    );
  };

  const handleAddAKA = (partyId: string) => {
    setCurrentPartyId(partyId);
    const party = filedAsToParties.find((p) => p.id === partyId);
    setAkaPartyType(party?.type || 'P');
    setAkaForm({
      ...akaForm,
      partyDesignationType: party?.type || 'P',
    });
    setShowAKAModal(true);
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
      organizationName: '',
    });
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
    // Navigate back to AddParty page with all data
    navigate('/services/jti-filing/add-party', {
      state: {
        caseData,
        parties,
        filedAsToParties, // Save current filed as to parties data
      },
    });
  };

  const handleContinue = () => {
    // ✅ UPDATED: Validate Filed As To Parties
    const isFiledAsToValid = filedAsToParties.every((party) => {
      if (party.type === 'P') {
        return party.firstName && party.lastName;
      } else {
        // For organization, check name OR firstName/lastName
        return party.name || (party.firstName && party.lastName);
      }
    });

    if (!isFiledAsToValid) {
      alert('Please fill in all required fields for all parties');
      return;
    }

    console.log('Filed As To Parties:', filedAsToParties);
    console.log('Case Data:', caseData);
    console.log('Parties:', parties);

    // Navigate to next page with all data
    navigate('/services/jti-filing/upload-documents', {
      state: {
        caseTypeId: caseData?.caseType,
        caseData,
        partyData: parties,
        partyWithFiledAsToData: filedAsToParties,
      },
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
      {/* Header */}
      <JTIHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {/* FILED AS TO PARTIES SECTION */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Filed As To Parties
            </h2>

            {filedAsToParties.map((party, index) => (
              <div
                key={party.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200"
              >
                {/* Party Header */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Filed As To Party #{index + 1}
                  </h3>
                  {filedAsToParties.length > 1 && (
                    <button
                      onClick={() => handleRemoveFiledAsToParty(party.id)}
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
                      onChange={(e) =>
                        handleFiledAsToPartyChange(
                          party.id,
                          'role',
                          e.target.value
                        )
                      }
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
                          onChange={(e) =>
                            handleFiledAsToPartyChange(
                              party.id,
                              'partySubtype.guardianAdLitem',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">
                          Guardian Ad Litem
                        </span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={party.partySubtype.incompetentPerson}
                          onChange={(e) =>
                            handleFiledAsToPartyChange(
                              party.id,
                              'partySubtype.incompetentPerson',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">
                          Incompetent Person
                        </span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={party.partySubtype.minor}
                          onChange={(e) =>
                            handleFiledAsToPartyChange(
                              party.id,
                              'partySubtype.minor',
                              e.target.checked
                            )
                          }
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
                      onChange={(e) =>
                        handleFiledAsToPartyChange(
                          party.id,
                          'type',
                          e.target.value
                        )
                      }
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
                          onChange={(e) =>
                            handleFiledAsToPartyChange(
                              party.id,
                              'firstName',
                              e.target.value
                            )
                          }
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
                          onChange={(e) =>
                            handleFiledAsToPartyChange(
                              party.id,
                              'middleName',
                              e.target.value
                            )
                          }
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
                          onChange={(e) =>
                            handleFiledAsToPartyChange(
                              party.id,
                              'lastName',
                              e.target.value
                            )
                          }
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
                          onChange={(e) =>
                            handleFiledAsToPartyChange(
                              party.id,
                              'suffix',
                              e.target.value
                            )
                          }
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
                          onChange={(e) =>
                            handleFiledAsToPartyChange(
                              party.id,
                              'name',
                              e.target.value
                            )
                          }
                          placeholder="Enter organization or single name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                    </>
                  )}

                  {/* Add AKA/DBA Button Only */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleAddAKA(party.id)}
                      className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add AKA/DBA
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back
                </button>

                <button
                  onClick={handleAddFiledAsToParty}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  Another Party
                </button>
              </div>

              <button
                onClick={handleContinue}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                Continue
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Add AKA/DBA Modal */}
      {showAKAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">AKA / DBA #1</h3>
              <button
                onClick={handleCloseAKAModal}
                className="p-1 hover:bg-white rounded transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Party Designation Type
                </label>
                <select
                  value={akaForm.partyDesignationType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setAkaPartyType(newType);
                    setAkaForm({
                      ...akaForm,
                      partyDesignationType: newType,
                    });
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
                <label className="block text-sm font-semibold text-gray-900">
                  Type<span className="text-red-500">*</span>
                </label>
                <select
                  value={akaForm.type}
                  onChange={(e) =>
                    setAkaForm({ ...akaForm, type: e.target.value })
                  }
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
                    <label className="block text-sm font-semibold text-gray-900">
                      First Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={akaForm.firstName}
                      onChange={(e) =>
                        setAkaForm({ ...akaForm, firstName: e.target.value })
                      }
                      placeholder="Enter first name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={akaForm.middleName}
                      onChange={(e) =>
                        setAkaForm({ ...akaForm, middleName: e.target.value })
                      }
                      placeholder="Enter middle name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Last Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={akaForm.lastName}
                      onChange={(e) =>
                        setAkaForm({ ...akaForm, lastName: e.target.value })
                      }
                      placeholder="Enter last name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Suffix
                    </label>
                    <input
                      type="text"
                      value={akaForm.suffix}
                      onChange={(e) =>
                        setAkaForm({ ...akaForm, suffix: e.target.value })
                      }
                      placeholder="Enter suffix (e.g., Jr., Sr., III)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Organization Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={akaForm.organizationName}
                      onChange={(e) =>
                        setAkaForm({
                          ...akaForm,
                          organizationName: e.target.value,
                        })
                      }
                      placeholder="Enter organization name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
              <button
                onClick={handleSaveAKA}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Save
              </button>
              <button
                onClick={handleCloseAKAModal}
                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPartyWithFiledAsTo;