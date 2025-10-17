import React, { useState } from 'react';
import { X, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Party {
    id: string;
    type: 'person' | 'organization';
    role: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    suffix?: string;
    organizationName?: string;
    partyType: 'plaintiff' | 'defendant';
    isLeadClient: boolean;
    billingCode?: string;
    caseRole: string;
    serviceRole: string;
}

interface ServeEntry {
    id: string;
    entityBeingServed: string;
    serveeType: string;
    capacity: string;
    registeredAgent: string;
}

const CaseParticipants = () => {
    const navigate = useNavigate();
    const [parties, setParties] = useState([]);
    const [showPartyModal, setShowPartyModal] = useState(false);
    const [partyFormType, setPartyFormType] = useState('person');
    const [numberOfParties, setNumberOfParties] = useState('');
    const [serveEntries, setServeEntries] = useState([]);
    const [showLeadClientModal, setShowLeadClientModal] = useState(false);
    const [selectedPartyForLeadClient, setSelectedPartyForLeadClient] = useState('');
    const [leadClientChangeType, setLeadClientChangeType] = useState('order');
    const [billingCodeChangeType, setBillingCodeChangeType] = useState('order');
    const [tempBillingCode, setTempBillingCode] = useState('');
    const [editingPartyId, setEditingPartyId] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [partyToDelete, setPartyToDelete] = useState(null);

    const [partyForm, setPartyForm] = useState({
        role: '',
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: 'Default',
        organizationName: '',
        partyType: 'defendant',
        isLeadClient: false,
        billingCode: ''
    });

    const getPartyDisplayName = (party) => {
        if (party.type === 'organization') {
            return party.organizationName;
        }
        return `${party.firstName} ${party.middleName ? party.middleName + ' ' : ''}${party.lastName}${party.suffix && party.suffix !== 'Default' ? ', ' + party.suffix : ''}`;
    };

    const handleAddParty = () => {
        setEditingPartyId(null);
        setShowPartyModal(true);
    };

    const handleEditParty = (party) => {
        setEditingPartyId(party.id);
        setPartyFormType(party.type);
        setPartyForm({
            role: party.role,
            firstName: party.firstName || '',
            middleName: party.middleName || '',
            lastName: party.lastName || '',
            suffix: party.suffix || 'Default',
            organizationName: party.organizationName || '',
            partyType: party.partyType,
            isLeadClient: party.isLeadClient,
            billingCode: party.billingCode || ''
        });
        setShowPartyModal(true);
    };

    const handleCloseModal = () => {
        setShowPartyModal(false);
        setPartyFormType('person');
        setEditingPartyId(null);
        setPartyForm({
            role: '',
            firstName: '',
            middleName: '',
            lastName: '',
            suffix: 'Default',
            organizationName: '',
            partyType: 'defendant',
            isLeadClient: false,
            billingCode: ''
        });
    };

    const handleSaveParty = () => {
        if (!partyForm.role) {
            alert('Please select a role');
            return;
        }
        if (partyFormType === 'person' && (!partyForm.firstName || !partyForm.lastName)) {
            alert('Please enter first name and last name');
            return;
        }
        if (partyFormType === 'organization' && !partyForm.organizationName) {
            alert('Please enter organization name');
            return;
        }

        if (editingPartyId) {
            // Update existing party
            const updatedParties = parties.map(p => {
                if (p.id === editingPartyId) {
                    return {
                        ...p,
                        type: partyFormType,
                        role: partyForm.role,
                        firstName: partyForm.firstName,
                        middleName: partyForm.middleName,
                        lastName: partyForm.lastName,
                        suffix: partyForm.suffix,
                        organizationName: partyForm.organizationName,
                        partyType: partyForm.partyType,
                        isLeadClient: partyForm.isLeadClient,
                        billingCode: partyForm.billingCode,
                        caseRole: partyForm.role,
                        serviceRole: partyForm.role
                    };
                }
                return partyForm.isLeadClient ? { ...p, isLeadClient: false } : p;
            });
            setParties(updatedParties);
        } else {
            // Add new party
            const newParty = {
                id: Date.now().toString(),
                type: partyFormType,
                role: partyForm.role,
                firstName: partyForm.firstName,
                middleName: partyForm.middleName,
                lastName: partyForm.lastName,
                suffix: partyForm.suffix,
                organizationName: partyForm.organizationName,
                partyType: partyForm.partyType,
                isLeadClient: partyForm.isLeadClient,
                billingCode: partyForm.billingCode,
                caseRole: partyForm.role,
                serviceRole: partyForm.role
            };

            if (newParty.isLeadClient) {
                setParties([...parties.map(p => ({ ...p, isLeadClient: false })), newParty]);
            } else {
                setParties([...parties, newParty]);
            }
        }
        handleCloseModal();
    };

    const handleDeleteParty = (id) => {
        setPartyToDelete(id);
        setShowDeleteConfirmModal(true);
    };

    const confirmDeleteParty = () => {
        setParties(parties.filter(p => p.id !== partyToDelete));
        setShowDeleteConfirmModal(false);
        setPartyToDelete(null);
    };

    const cancelDeleteParty = () => {
        setShowDeleteConfirmModal(false);
        setPartyToDelete(null);
    };
    const handleDeleteServeEntry = (id) => {
        const updatedEntries = serveEntries.filter(s => s.id !== id);
        setServeEntries(updatedEntries);

        // Update the numberOfParties dropdown to reflect the current count
        const newCount = updatedEntries.length;
        if (newCount === 0) {
            setNumberOfParties('');
        } else {
            setNumberOfParties(newCount.toString());
        }
    };
    const handleReset = () => {
        setParties([]);
        setNumberOfParties('');
        setServeEntries([]);
    };

    const handleNumberOfPartiesChange = (value) => {
        setNumberOfParties(value);
        const num = parseInt(value);
        if (!isNaN(num)) {
            const newEntries = [];
            for (let i = 0; i < num; i++) {
                newEntries.push({
                    id: `serve-${Date.now()}-${i}`,
                    entityBeingServed: '',
                    serveeType: '',
                    capacity: '',
                    registeredAgent: ''
                });
            }
            setServeEntries(newEntries);
        } else {
            setServeEntries([]);
        }
    };

    const handleUpdateServeEntry = (id, field, value) => {
        setServeEntries(serveEntries.map(entry => {
            if (entry.id === id) {
                const updatedEntry = { ...entry, [field]: value };

                // Auto-populate serveeType based on selected party's role
                if (field === 'entityBeingServed' && value) {
                    const selectedParty = parties.find(p => p.id === value);
                    if (selectedParty && selectedParty.role) {
                        updatedEntry.serveeType = selectedParty.role;
                    }
                }

                return updatedEntry;
            }
            return entry;
        }));
    };

    const handleLeadClientCheckboxClick = (partyId, currentStatus) => {
        if (currentStatus) {
            setParties(parties.map(p => p.id === partyId ? { ...p, isLeadClient: false } : p));
        } else {
            const party = parties.find(p => p.id === partyId);
            setSelectedPartyForLeadClient(partyId);
            setTempBillingCode(party?.billingCode || '');
            setShowLeadClientModal(true);
        }
    };

    const handleConfirmLeadClient = () => {
        setParties(parties.map(p => ({
            ...p,
            isLeadClient: p.id === selectedPartyForLeadClient,
            billingCode: p.id === selectedPartyForLeadClient ? tempBillingCode : p.billingCode
        })));
        setShowLeadClientModal(false);
        setSelectedPartyForLeadClient('');
        setTempBillingCode('');
    };

    const handleCancelLeadClient = () => {
        setShowLeadClientModal(false);
        setSelectedPartyForLeadClient('');
        setTempBillingCode('');
    };

    const handleSaveAndNext = () => {
        if (parties.length === 0) {
            alert('Please add at least one party before proceeding');
            return;
        }
        if (!parties.some(p => p.isLeadClient)) {
            alert('Please select at least one Lead Client before proceeding');
            return;
        }
        if (!numberOfParties || numberOfParties === '') {
            alert('Please select number of Party(s) to Serve before proceeding');
            return;
        }

        const hasEmptyEntity = serveEntries.some(entry => !entry.entityBeingServed);
        if (hasEmptyEntity) {
            alert('Please select an entity for all Party(s) to Serve entries');
            return;
        }

        console.log('Saving parties:', parties);
        console.log('Saving serve entries:', serveEntries);

        // Navigate to document upload page with data
        navigate('/services/process-serving/documents-upload', {
            state: {
                parties: parties,
                serveEntries: serveEntries
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate('/services/process-serving/case-info')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Process Serving</h1>
                                <p className="text-sm text-gray-500">Add case participants</p>
                            </div>
                        </div>
                        <button onClick={() => alert('Navigating to dashboard...')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-indigo-600">Case Participants</h2>
                                <button onClick={handleReset} className="text-sm text-indigo-600 hover:underline mt-1">Reset Order</button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm text-gray-700">Click here to add Case Participants if not already listed below:</p>
                            <button onClick={handleAddParty} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm">
                                Add Party(s)
                            </button>
                        </div>

                        <div className="overflow-x-auto mb-8">
                            <table className="w-full">
                                <thead className="bg-indigo-500 text-white">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Lead Client</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Case Role</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Service Role</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {parties.length === 0 ? (
                                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No participants added yet</td></tr>
                                    ) : (
                                        parties.map((party) => (
                                            <tr key={party.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <input type="checkbox" checked={party.isLeadClient} onChange={() => handleLeadClientCheckboxClick(party.id, party.isLeadClient)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer" />
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{getPartyDisplayName(party)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{party.caseRole}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{party.serviceRole}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => handleEditParty(party)} className="p-1 text-gray-600 hover:bg-gray-100 rounded transition"><Edit2 className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteParty(party.id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center gap-4 mb-4">
                                <label className="text-sm font-semibold text-gray-700">Select number of Party(s) to Serve:</label>
                                <select value={numberOfParties} onChange={(e) => handleNumberOfPartiesChange(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="">Select</option>
                                    {[...Array(15)].map((_, i) => (<option key={i + 1} value={i + 1}>{i + 1}</option>))}
                                </select>
                                <span className="text-sm text-gray-600">(for more than 15 Party(s), please place multiple orders)</span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-indigo-500 text-white">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Entity Being Served*</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Servee Type</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Capacity</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Registered Agent</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {serveEntries.length === 0 ? (
                                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">There are no Case Serve entered</td></tr>
                                        ) : (
                                            serveEntries.map((entry) => (
                                                <tr key={entry.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">
                                                        <select value={entry.entityBeingServed} onChange={(e) => handleUpdateServeEntry(entry.id, 'entityBeingServed', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                                                            <option value="">Select...</option>
                                                            {parties.map((party) => (<option key={party.id} value={party.id}>{getPartyDisplayName(party)}</option>))}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <select value={entry.serveeType} onChange={(e) => handleUpdateServeEntry(entry.id, 'serveeType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                                                            <option value="">Select...</option>
                                                            <option value="Witness">Witness</option>
                                                            <option value="Defendant">Defendant</option>
                                                            <option value="Plaintiff">Plaintiff</option>
                                                            <option value="Attorney">Attorney</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <select value={entry.capacity} onChange={(e) => handleUpdateServeEntry(entry.id, 'capacity', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                                                            <option value="">Select...</option>
                                                            <option value="Individual">Individual</option>
                                                            <option value="Corporate">Corporate</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input type="text" value={entry.registeredAgent} onChange={(e) => handleUpdateServeEntry(entry.id, 'registeredAgent', e.target.value)} placeholder="Registered Agent" className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button onClick={() => handleDeleteServeEntry(entry.id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition mx-auto block"><X className="w-4 h-4" /></button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between rounded-b-xl">
                        <button onClick={() => navigate('/services/process-serving/case-info')} className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">&lt; Back</button>
                        <div className="flex gap-3">
                            <button onClick={handleSaveAndNext} className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm">Save & Next &gt;</button>
                            <button className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm">Save as Draft</button>
                        </div>
                    </div>
                </div>
            </main>

            {showPartyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between sticky top-0">
                            <h3 className="text-xl font-bold">{editingPartyId ? 'Edit Party' : 'Add Party'}</h3>
                            <button onClick={handleCloseModal} className="p-1 hover:bg-indigo-700 rounded transition"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-center gap-8">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="partyType" checked={partyFormType === 'organization'} onChange={() => setPartyFormType('organization')} className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-medium text-gray-700">Organization</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="partyType" checked={partyFormType === 'person'} onChange={() => setPartyFormType('person')} className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-medium text-gray-700">Person</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Role :</label>
                                <select value={partyForm.role} onChange={(e) => setPartyForm({ ...partyForm, role: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                    <option value="">Select...</option>
                                    <option value="Plaintiff">Plaintiff</option>
                                    <option value="Defendant">Defendant</option>
                                    <option value="Witness">Witness</option>
                                    <option value="Attorney">Attorney</option>
                                </select>
                            </div>
                            {partyFormType === 'person' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                            <input type="text" value={partyForm.firstName} onChange={(e) => setPartyForm({ ...partyForm, firstName: e.target.value })} placeholder="First Name" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Middle Name</label>
                                            <input type="text" value={partyForm.middleName} onChange={(e) => setPartyForm({ ...partyForm, middleName: e.target.value })} placeholder="Middle Name" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                                            <input type="text" value={partyForm.lastName} onChange={(e) => setPartyForm({ ...partyForm, lastName: e.target.value })} placeholder="Last Name" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Suffix</label>
                                            <select value={partyForm.suffix} onChange={(e) => setPartyForm({ ...partyForm, suffix: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                                <option value="Default">Default</option>
                                                <option value="Jr.">Jr.</option>
                                                <option value="Sr.">Sr.</option>
                                                <option value="II">II</option>
                                                <option value="III">III</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                                    <input type="text" value={partyForm.organizationName} onChange={(e) => setPartyForm({ ...partyForm, organizationName: e.target.value })} placeholder="Name" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Party Type</label>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={partyForm.partyType === 'plaintiff'} onChange={() => setPartyForm({ ...partyForm, partyType: 'plaintiff' })} className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm text-gray-700">Plaintiff</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={partyForm.partyType === 'defendant'} onChange={() => setPartyForm({ ...partyForm, partyType: 'defendant' })} className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm text-gray-700">Defendant</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Is this your Lead Client ?</label>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={partyForm.isLeadClient === true} onChange={() => setPartyForm({ ...partyForm, isLeadClient: true })} className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm text-gray-700">Yes</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={partyForm.isLeadClient === false} onChange={() => setPartyForm({ ...partyForm, isLeadClient: false })} className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm text-gray-700">No</span>
                                    </label>
                                </div>
                            </div>
                            {partyForm.isLeadClient && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Billing Code</label>
                                    <input type="text" value={partyForm.billingCode} onChange={(e) => setPartyForm({ ...partyForm, billingCode: e.target.value })} placeholder="Billing Code" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            )}
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-center gap-4 sticky bottom-0">
                            <button onClick={handleSaveParty} className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">Save</button>
                            <button onClick={handleCloseModal} className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showLeadClientModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                        <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Change Lead Client</h3>
                            <button onClick={handleCancelLeadClient} className="p-1 hover:bg-indigo-700 rounded transition"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Change Lead Client ?</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={leadClientChangeType === 'order'} onChange={() => setLeadClientChangeType('order')} className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm text-gray-700">For this order only</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={leadClientChangeType === 'all'} onChange={() => setLeadClientChangeType('all')} className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm text-gray-700">For this and All Orders Following</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Change the Billing Code ?</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={billingCodeChangeType === 'order'} onChange={() => setBillingCodeChangeType('order')} className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm text-gray-700">For this order only</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={billingCodeChangeType === 'all'} onChange={() => setBillingCodeChangeType('all')} className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm text-gray-700">For this and All Orders Following</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Billing Code</label>
                                <input type="text" value={tempBillingCode} onChange={(e) => setTempBillingCode(e.target.value)} placeholder="Billing Code" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-center gap-4">
                            <button onClick={handleConfirmLeadClient} className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">Save</button>
                            <button onClick={handleCancelLeadClient} className="px-8 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Confirm Delete</h3>
                            <button onClick={cancelDeleteParty} className="p-1 hover:bg-red-700 rounded transition"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 text-lg">Are you sure you want to delete this party?</p>
                            <p className="text-gray-500 text-sm mt-2">This action cannot be undone.</p>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-center gap-4">
                            <button onClick={confirmDeleteParty} className="px-8 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">Delete</button>
                            <button onClick={cancelDeleteParty} className="px-8 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaseParticipants;