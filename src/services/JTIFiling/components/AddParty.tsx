import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Plus, Trash2 } from 'lucide-react';

interface Party {
  id: string;
  role: string;
  partySubtype: {
    guardianAdLitem: boolean;
    incompetentPerson: boolean;
    minor: boolean;
  };
  type: 'person' | 'organization';
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
}

const AddParty: React.FC = () => {
  const navigate = useNavigate();
  const [parties, setParties] = useState<Party[]>([
    {
      id: '1',
      role: 'Plaintiff',
      partySubtype: {
        guardianAdLitem: false,
        incompetentPerson: false,
        minor: false
      },
      type: 'person',
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      name: '',
      needInterpreter: false,
      filingFeesExemption: false,
      representingYourself: false
    }
  ]);

  // Modal states
  const [showAttorneyModal, setShowAttorneyModal] = useState(false);
  const [showAKAModal, setShowAKAModal] = useState(false);
  const [currentPartyId, setCurrentPartyId] = useState<string>('');
  const [akaType, setAkaType] = useState<'person' | 'organization'>('person');

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
    partyDesignationType: 'person',
    type: 'Also Known As',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    organizationName: ''
  });

  const roles = [
    'Plaintiff',
    'Defendant',
    'Petitioner',
    'Respondent',
    'Cross-Complainant',
    'Cross-Defendant'
  ];

  const handleAddParty = () => {
    const newParty: Party = {
      id: Date.now().toString(),
      role: 'Plaintiff',
      partySubtype: {
        guardianAdLitem: false,
        incompetentPerson: false,
        minor: false
      },
      type: 'person',
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      name: '',
      needInterpreter: false,
      filingFeesExemption: false,
      representingYourself: false
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
    setAkaType(party?.type || 'person');
    setAkaForm({
      ...akaForm,
      partyDesignationType: party?.type || 'person'
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
      partyDesignationType: 'person',
      type: 'Also Known As',
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
    console.log('Saving attorney:', attorneyForm);
    handleCloseAttorneyModal();
    alert('Attorney added successfully!');
  };

  const handleSaveAKA = () => {
    if (akaType === 'person') {
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

  const handleContinue = () => {
    const isValid = parties.every(party => {
      if (party.type === 'person') {
        return party.firstName && party.lastName;
      } else {
        return party.name;
      }
    });

    if (!isValid) {
      alert('Please fill in all required fields for all parties');
      return;
    }

    console.log('Parties data:', parties);
    //alert('Parties saved successfully!');
    navigate('/services/jti-filing/add-PartyWithFiledAsTo');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/services/jti-filing/new-case')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">JTI E-Filing</h1>
                <p className="text-sm text-gray-500">Add parties to the case</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/jti-filing/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
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
                    value={party.type === 'person' ? 'Person' : 'Organization / Single Name Party'}
                    onChange={(e) => handlePartyChange(party.id, 'type', e.target.value === 'Person' ? 'person' : 'organization')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="Person">Person</option>
                    <option value="Organization / Single Name Party">Organization / Single Name Party</option>
                  </select>
                </div>

                {/* Conditional Fields based on Type */}
                {party.type === 'person' ? (
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
                          <option value="spanish">Spanish</option>
                          <option value="mandarin">Mandarin</option>
                          <option value="french">French</option>
                          <option value="german">German</option>
                          <option value="other">Other</option>
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
                          <option value="indigent">Indigent Status</option>
                          <option value="public-benefit">Public Benefit Recipient</option>
                          <option value="low-income">Low Income</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Are You Representing Yourself on this Case? */}
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={party.representingYourself}
                        onChange={(e) => handlePartyChange(party.id, 'representingYourself', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Are You Representing Yourself on this Case?</span>
                    </label>

                    {party.representingYourself && (
                      <div className="ml-6 space-y-6">
                        {/* Address Section */}
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-900">Address #1</h4>
                            <button className="p-1 hover:bg-gray-200 rounded transition">
                              <Trash2 className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">
                              Country<span className="text-red-500">*</span>
                            </label>
                            <select
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                            >
                              <option value="US">United States</option>
                              <option value="CA">Canada</option>
                              <option value="MX">Mexico</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">
                              Address 1<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
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
                              placeholder="City"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">
                              State<span className="text-red-500">*</span>
                            </label>
                            <select
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                            >
                              <option value="">Select state</option>
                              <option value="CA">California</option>
                              <option value="NY">New York</option>
                              <option value="TX">Texas</option>
                              <option value="FL">Florida</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">
                              Zip<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="ZIP code"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Address
                        </button>

                        {/* Phone Section */}
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-900">Phone #1</h4>
                            <button className="p-1 hover:bg-gray-200 rounded transition">
                              <Trash2 className="w-4 h-4 text-gray-600" />
                            </button>
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

                        <button
                          type="button"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Phone
                        </button>

                        {/* Email Section */}
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-900">Email #1</h4>
                            <button className="p-1 hover:bg-gray-200 rounded transition">
                              <Trash2 className="w-4 h-4 text-gray-600" />
                            </button>
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
                              placeholder="Email address"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Email
                        </button>

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

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <button
                    onClick={() => handleAddAttorney(party.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Attorney
                  </button>

                  <button
                    onClick={() => handleAddAKA(party.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add AKA/DBA
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Another Party & Continue Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleAddParty}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Another Party
            </button>

            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
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
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Add Representation #1</h3>
              <button
                onClick={handleCloseAttorneyModal}
                className="p-1 hover:bg-white rounded transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Bar Number Search */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Bar Number Search
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={attorneyForm.barNumberSearch}
                    onChange={(e) => setAttorneyForm({...attorneyForm, barNumberSearch: e.target.value})}
                    placeholder="Enter bar number"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium">
                    Search
                  </button>
                </div>
                <p className="text-xs text-gray-500">Please enter at least 4 digits for bar number search</p>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Role<span className="text-red-500">*</span>
                </label>
                <select
                  value={attorneyForm.role}
                  onChange={(e) => setAttorneyForm({...attorneyForm, role: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="Attorney">Attorney</option>
                  <option value="Co-Counsel">Co-Counsel</option>
                </select>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Type<span className="text-red-500">*</span>
                </label>
                <select
                  value={attorneyForm.type}
                  onChange={(e) => setAttorneyForm({...attorneyForm, type: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="Attorney">Attorney</option>
                  <option value="Pro Se">Pro Se</option>
                </select>
              </div>

              {/* Firm */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Firm
                </label>
                <input
                  type="text"
                  value={attorneyForm.firm}
                  onChange={(e) => setAttorneyForm({...attorneyForm, firm: e.target.value})}
                  placeholder="Enter firm name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Bar Number */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Bar Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={attorneyForm.barNumber}
                  onChange={(e) => setAttorneyForm({...attorneyForm, barNumber: e.target.value})}
                  placeholder="Enter bar number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  First Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={attorneyForm.firstName}
                  onChange={(e) => setAttorneyForm({...attorneyForm, firstName: e.target.value})}
                  placeholder="Enter first name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Middle */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Middle
                </label>
                <input
                  type="text"
                  value={attorneyForm.middle}
                  onChange={(e) => setAttorneyForm({...attorneyForm, middle: e.target.value})}
                  placeholder="Enter middle name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Last Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={attorneyForm.lastName}
                  onChange={(e) => setAttorneyForm({...attorneyForm, lastName: e.target.value})}
                  placeholder="Enter last name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Suffix */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Suffix
                </label>
                <input
                  type="text"
                  value={attorneyForm.suffix}
                  onChange={(e) => setAttorneyForm({...attorneyForm, suffix: e.target.value})}
                  placeholder="Enter suffix"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={attorneyForm.email}
                  onChange={(e) => setAttorneyForm({...attorneyForm, email: e.target.value})}
                  placeholder="Enter email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Alt Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Alt Email
                </label>
                <input
                  type="email"
                  value={attorneyForm.altEmail}
                  onChange={(e) => setAttorneyForm({...attorneyForm, altEmail: e.target.value})}
                  placeholder="Enter alternate email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Consent to eService */}
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attorneyForm.consentToEService}
                  onChange={(e) => setAttorneyForm({...attorneyForm, consentToEService: e.target.checked})}
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

              {/* Address & Phone sections abbreviated for space */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900">Address #1</h4>
                <div className="space-y-2">
                  <input type="text" placeholder="Street address" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <input type="text" placeholder="City" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-gray-900">Phone #1</h4>
                <input type="tel" placeholder="Phone number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
              <button
                onClick={handleSaveAttorney}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Save
              </button>
              <button
                onClick={handleCloseAttorneyModal}
                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add AKA/DBA Modal */}
      {showAKAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">AKA / DBA #1</h3>
              <button
                onClick={handleCloseAKAModal}
                className="p-1 hover:bg-white rounded transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Party Designation Type */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Party Designation Type
                </label>
                <select
                  value={akaForm.partyDesignationType === 'person' ? 'Person' : 'Organization / Single Name Party'}
                  onChange={(e) => {
                    const newType = e.target.value === 'Person' ? 'person' : 'organization';
                    setAkaType(newType);
                    setAkaForm({...akaForm, partyDesignationType: newType});
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="Person">Person</option>
                  <option value="Organization / Single Name Party">Organization / Single Name Party</option>
                </select>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Type<span className="text-red-500">*</span>
                </label>
                <select
                  value={akaForm.type}
                  onChange={(e) => setAkaForm({...akaForm, type: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="Also Known As">Also Known As</option>
                  <option value="Doing Business As">Doing Business As</option>
                  <option value="Formerly Known As">Formerly Known As</option>
                </select>
              </div>

              {/* Conditional Fields based on Party Type */}
              {akaType === 'person' ? (
                <>
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      First Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={akaForm.firstName}
                      onChange={(e) => setAkaForm({...akaForm, firstName: e.target.value})}
                      placeholder="Enter first name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* Middle Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={akaForm.middleName}
                      onChange={(e) => setAkaForm({...akaForm, middleName: e.target.value})}
                      placeholder="Enter middle name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Last Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={akaForm.lastName}
                      onChange={(e) => setAkaForm({...akaForm, lastName: e.target.value})}
                      placeholder="Enter last name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* Suffix */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Suffix
                    </label>
                    <input
                      type="text"
                      value={akaForm.suffix}
                      onChange={(e) => setAkaForm({...akaForm, suffix: e.target.value})}
                      placeholder="Enter suffix (e.g., Jr., Sr., III)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Organization Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Organization Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={akaForm.organizationName}
                      onChange={(e) => setAkaForm({...akaForm, organizationName: e.target.value})}
                      placeholder="Enter organization name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
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

export default AddParty;