import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Plus, Trash2 } from 'lucide-react';
import JTIHeader from './JTIHeader';

interface FiledAsToParty {
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
}

const AddParty: React.FC = () => {
    const navigate = useNavigate();

    // Filed As To Parties (Defendants/Respondents)
    const [filedAsToParties, setFiledAsToParties] = useState<FiledAsToParty[]>([
        {
            id: '1',
            role: 'Defendant',
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
            name: ''
        }
    ]);

    // Modal states
    const [showAKAModal, setShowAKAModal] = useState(false);
    const [currentPartyId, setCurrentPartyId] = useState<string>('');
    const [akaType, setAkaType] = useState<'person' | 'organization'>('person');

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

    const filedAsToRoles = ['Defendant', 'Respondent', 'Cross-Defendant'];

    // Filed As To Party Handlers
    const handleAddFiledAsToParty = () => {
        const newParty: FiledAsToParty = {
            id: Date.now().toString(),
            role: 'Defendant',
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
            name: ''
        };
        setFiledAsToParties([...filedAsToParties, newParty]);
    };

    const handleRemoveFiledAsToParty = (id: string) => {
        if (filedAsToParties.length > 1) {
            setFiledAsToParties(filedAsToParties.filter(party => party.id !== id));
        }
    };

    const handleFiledAsToPartyChange = (id: string, field: string, value: any) => {
        setFiledAsToParties(filedAsToParties.map(party => {
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

    const handleAddAKA = (partyId: string) => {
        setCurrentPartyId(partyId);

        const party = filedAsToParties.find(p => p.id === partyId);

        setAkaType(party?.type || 'person');
        setAkaForm({
            ...akaForm,
            partyDesignationType: party?.type || 'person'
        });
        setShowAKAModal(true);
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
        // Validate Filed As To Parties
        const isFiledAsToValid = filedAsToParties.every(party => {
            if (party.type === 'person') {
                return party.firstName && party.lastName;
            } else {
                return party.name;
            }
        });

        if (!isFiledAsToValid) {
            alert('Please fill in all required fields for all parties');
            return;
        }

        console.log('Filed As To Parties:', filedAsToParties);
        //alert('All parties saved successfully!');
        navigate('/services/jti-filing/upload-documents');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <JTIHeader />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="space-y-6">
                    {/* FILED AS TO PARTIES SECTION */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Filed As To Parties</h2>

                        {filedAsToParties.map((party, index) => (
                            <div key={party.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
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
                                            onChange={(e) => handleFiledAsToPartyChange(party.id, 'role', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                                        >
                                            {filedAsToRoles.map((role) => (
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
                                                    onChange={(e) => handleFiledAsToPartyChange(party.id, 'partySubtype.guardianAdLitem', e.target.checked)}
                                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-gray-700">Guardian Ad Litem</span>
                                            </label>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={party.partySubtype.incompetentPerson}
                                                    onChange={(e) => handleFiledAsToPartyChange(party.id, 'partySubtype.incompetentPerson', e.target.checked)}
                                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-gray-700">Incompetent Person</span>
                                            </label>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={party.partySubtype.minor}
                                                    onChange={(e) => handleFiledAsToPartyChange(party.id, 'partySubtype.minor', e.target.checked)}
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
                                            onChange={(e) => handleFiledAsToPartyChange(party.id, 'type', e.target.value === 'Person' ? 'person' : 'organization')}
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
                                                    onChange={(e) => handleFiledAsToPartyChange(party.id, 'firstName', e.target.value)}
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
                                                    onChange={(e) => handleFiledAsToPartyChange(party.id, 'middleName', e.target.value)}
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
                                                    onChange={(e) => handleFiledAsToPartyChange(party.id, 'lastName', e.target.value)}
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
                                                    onChange={(e) => handleFiledAsToPartyChange(party.id, 'suffix', e.target.value)}
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
                                                    onChange={(e) => handleFiledAsToPartyChange(party.id, 'name', e.target.value)}
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
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleAddFiledAsToParty}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
                            >
                                <Plus className="w-5 h-5" />
                                Another Party
                            </button>

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
                </div>
            </main>

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
                            <select
                                value={akaForm.partyDesignationType === 'person' ? 'Person' : 'Organization / Single Name Party'}
                                onChange={(e) => {
                                    const newType = e.target.value === 'Person' ? 'person' : 'organization';
                                    setAkaType(newType);
                                    setAkaForm({ ...akaForm, partyDesignationType: newType });
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            >
                                <option value="Person">Person</option>
                                <option value="Organization / Single Name Party">Organization / Single Name Party</option>
                            </select>

                            {akaType === 'person' ? (
                                <>
                                    <input type="text" value={akaForm.firstName} onChange={(e) => setAkaForm({ ...akaForm, firstName: e.target.value })} placeholder="First Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                                    <input type="text" value={akaForm.lastName} onChange={(e) => setAkaForm({ ...akaForm, lastName: e.target.value })} placeholder="Last Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                                </>
                            ) : (
                                <input type="text" value={akaForm.organizationName} onChange={(e) => setAkaForm({ ...akaForm, organizationName: e.target.value })} placeholder="Organization Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                            )}
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
                            <button onClick={handleSaveAKA} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                                Save
                            </button>
                            <button onClick={handleCloseAKAModal} className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium">
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