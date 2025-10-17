import React, { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface ServeInfoForm {
    id: string;
    residence: string;
    address: string;
    timeZone: string;
    hearingDateTime: string;
    deptDiv: string;
    phoneNumber: string;
    advanceWitnessFees: 'yes' | 'no';
    advanceWitnessFeesAmount: string;
    mustMail: string[];
    proof: string[];
    noSpecialInstructions: boolean;
    specialInstructions: string;
}

const ServeInfo = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get all data from location.state
    const serveEntriesData = location.state?.serveEntries || [];
    const partiesData = location.state?.parties || [];
    const documentsData = location.state?.documents || [];
    const serveAllWithSameDoc = location.state?.serveAllWithSameDoc || false;

    const [serveEntries] = useState(
        serveEntriesData.map((entry: any) => {
            const party = partiesData.find((p: any) => p.id === entry.entityBeingServed);
            const partyName = party ? (
                party.type === 'organization'
                    ? party.organizationName
                    : `${party.firstName} ${party.middleName ? party.middleName + ' ' : ''}${party.lastName}${party.suffix && party.suffix !== 'Default' ? ', ' + party.suffix : ''}`
            ) : 'Unknown';

            return {
                id: entry.id,
                name: partyName,
                capacity: entry.capacity || 'Authorized Person'
            };
        })
    );

    const [serveAllAtSameAddress, setServeAllAtSameAddress] = useState(true);

    const [singleForm, setSingleForm] = useState<ServeInfoForm>({
        id: 'all',
        residence: 'Residence',
        address: '',
        timeZone: 'Pacific Standard Time',
        hearingDateTime: '',
        deptDiv: '',
        phoneNumber: '',
        advanceWitnessFees: 'no',
        advanceWitnessFeesAmount: '',
        mustMail: [],
        proof: [],
        noSpecialInstructions: false,
        specialInstructions: ''
    });

    const [multipleForms, setMultipleForms] = useState<ServeInfoForm[]>(
        serveEntries.map((entry: any) => ({
            id: entry.id,
            residence: 'Residence',
            address: '',
            timeZone: 'Pacific Standard Time',
            hearingDateTime: '',
            deptDiv: '',
            phoneNumber: '',
            advanceWitnessFees: 'no',
            advanceWitnessFeesAmount: '',
            mustMail: [],
            proof: [],
            noSpecialInstructions: false,
            specialInstructions: ''
        }))
    );

    useEffect(() => {
        if (serveEntries.length === 0) {
            alert('No serve entries found. Please complete the previous steps.');
            navigate('/services/process-serving/case-participants');
        }
    }, [serveEntries, navigate]);

    const residenceOptions = ['Residence', 'Business', 'Other'];
    const timeZoneOptions = [
        'Pacific Standard Time',
        'Mountain Standard Time',
        'Central Standard Time',
        'Eastern Standard Time'
    ];

    const handleSingleFormChange = (field: keyof ServeInfoForm, value: any) => {
        setSingleForm({ ...singleForm, [field]: value });
    };

    const handleMultipleFormChange = (id: string, field: keyof ServeInfoForm, value: any) => {
        setMultipleForms(multipleForms.map(form =>
            form.id === id ? { ...form, [field]: value } : form
        ));
    };

    const handleCheckboxChange = (id: string, field: 'mustMail' | 'proof', value: string, checked: boolean) => {
        if (serveAllAtSameAddress) {
            const current = singleForm[field] as string[];
            setSingleForm({
                ...singleForm,
                [field]: checked
                    ? [...current, value]
                    : current.filter(item => item !== value)
            });
        } else {
            setMultipleForms(multipleForms.map(form => {
                if (form.id === id) {
                    const current = form[field] as string[];
                    return {
                        ...form,
                        [field]: checked
                            ? [...current, value]
                            : current.filter(item => item !== value)
                    };
                }
                return form;
            }));
        }
    };

    const handleReset = () => {
        setServeAllAtSameAddress(true);
        setSingleForm({
            id: 'all',
            residence: 'Residence',
            address: '',
            timeZone: 'Pacific Standard Time',
            hearingDateTime: '',
            deptDiv: '',
            phoneNumber: '',
            advanceWitnessFees: 'no',
            advanceWitnessFeesAmount: '',
            mustMail: [],
            proof: [],
            noSpecialInstructions: false,
            specialInstructions: ''
        });
        setMultipleForms(
            serveEntries.map((entry: any) => ({
                id: entry.id,
                residence: 'Residence',
                address: '',
                timeZone: 'Pacific Standard Time',
                hearingDateTime: '',
                deptDiv: '',
                phoneNumber: '',
                advanceWitnessFees: 'no',
                advanceWitnessFeesAmount: '',
                mustMail: [],
                proof: [],
                noSpecialInstructions: false,
                specialInstructions: ''
            }))
        );
    };

    const validateForm = (form: ServeInfoForm) => {
        if (!form.address.trim()) return false;
        if (!form.phoneNumber.trim()) return false;
        return true;
    };

    const handleSaveAndNext = () => {
        if (serveAllAtSameAddress) {
            if (!validateForm(singleForm)) {
                alert('Please fill in all required fields (Address and Phone Number)');
                return;
            }
        } else {
            const allValid = multipleForms.every(form => validateForm(form));
            if (!allValid) {
                alert('Please fill in all required fields for all parties (Address and Phone Number)');
                return;
            }
        }

        console.log('Serve info data:', serveAllAtSameAddress ? singleForm : multipleForms);

        // Navigate to Order Details page with all collected data
        navigate('/services/process-serving/order-details', {
            state: {
                serveEntries: serveEntriesData,
                parties: partiesData,
                documents: documentsData,
                serveInfo: serveAllAtSameAddress ? singleForm : multipleForms,
                serveAllAtSameAddress: serveAllAtSameAddress,
                serveAllWithSameDoc: serveAllWithSameDoc
            }
        });
    };

    const handleBack = () => {
        navigate('/services/process-serving/documents-upload', {
            state: location.state
        });
    };

    const renderForm = (form: ServeInfoForm, partyName?: string, partyCapacity?: string, isFirstParty?: boolean) => {
        const isMultiple = !serveAllAtSameAddress;
        const formId = form.id;

        return (
            <div key={formId} className="mb-8">
                {partyName && (
                    <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Address For: {partyName}</span>
                            <span className="text-sm italic">({partyCapacity})</span>
                        </div>
                        {isMultiple && isFirstParty && (
                            <label className="flex items-center gap-3 cursor-pointer">
                                <span className="text-sm">Serve All Parties at the same address</span>
                                <input
                                    type="checkbox"
                                    checked={serveAllAtSameAddress}
                                    onChange={(e) => setServeAllAtSameAddress(e.target.checked)}
                                    className="w-5 h-5 rounded border-white"
                                />
                            </label>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <select
                        value={form.residence}
                        onChange={(e) => isMultiple
                            ? handleMultipleFormChange(formId, 'residence', e.target.value)
                            : handleSingleFormChange('residence', e.target.value)
                        }
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                        {residenceOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        value={form.address}
                        onChange={(e) => isMultiple
                            ? handleMultipleFormChange(formId, 'address', e.target.value)
                            : handleSingleFormChange('address', e.target.value)
                        }
                        placeholder="Address"
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Time Zone :</label>
                        <select
                            value={form.timeZone}
                            onChange={(e) => isMultiple
                                ? handleMultipleFormChange(formId, 'timeZone', e.target.value)
                                : handleSingleFormChange('timeZone', e.target.value)
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        >
                            {timeZoneOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Hearing Date/Time :</label>
                        <input
                            type="datetime-local"
                            value={form.hearingDateTime}
                            onChange={(e) => isMultiple
                                ? handleMultipleFormChange(formId, 'hearingDateTime', e.target.value)
                                : handleSingleFormChange('hearingDateTime', e.target.value)
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number :</label>
                        <input
                            type="tel"
                            value={form.phoneNumber}
                            onChange={(e) => isMultiple
                                ? handleMultipleFormChange(formId, 'phoneNumber', e.target.value)
                                : handleSingleFormChange('phoneNumber', e.target.value)
                            }
                            placeholder="Phone Number"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Dept/Div :</label>
                        <input
                            type="text"
                            value={form.deptDiv}
                            onChange={(e) => isMultiple
                                ? handleMultipleFormChange(formId, 'deptDiv', e.target.value)
                                : handleSingleFormChange('deptDiv', e.target.value)
                            }
                            placeholder="Dept/Div"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Advance Witness Fees:</label>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={form.advanceWitnessFees === 'yes'}
                                        onChange={() => isMultiple
                                            ? handleMultipleFormChange(formId, 'advanceWitnessFees', 'yes')
                                            : handleSingleFormChange('advanceWitnessFees', 'yes')
                                        }
                                        className="w-4 h-4 text-indigo-600"
                                    />
                                    <span className="text-sm text-gray-700">Yes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={form.advanceWitnessFees === 'no'}
                                        onChange={() => isMultiple
                                            ? handleMultipleFormChange(formId, 'advanceWitnessFees', 'no')
                                            : handleSingleFormChange('advanceWitnessFees', 'no')
                                        }
                                        className="w-4 h-4 text-indigo-600"
                                    />
                                    <span className="text-sm text-gray-700">No</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            {form.advanceWitnessFees === 'yes' && (
                                <>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amount :</label>
                                    <input
                                        type="text"
                                        value={form.advanceWitnessFeesAmount}
                                        onChange={(e) => isMultiple
                                            ? handleMultipleFormChange(formId, 'advanceWitnessFeesAmount', e.target.value)
                                            : handleSingleFormChange('advanceWitnessFeesAmount', e.target.value)
                                        }
                                        placeholder="Enter Amount"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Must Mail:</label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.mustMail.includes('Certified With Receipt Requested')}
                                    onChange={(e) => handleCheckboxChange(formId, 'mustMail', 'Certified With Receipt Requested', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">Certified With Receipt Requested</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.mustMail.includes('Certified, No receipt requested')}
                                    onChange={(e) => handleCheckboxChange(formId, 'mustMail', 'Certified, No receipt requested', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">Certified, No receipt requested</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Proof:</label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.proof.includes('File (Additional fee will apply)')}
                                    onChange={(e) => handleCheckboxChange(formId, 'proof', 'File (Additional fee will apply)', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">File (Additional fee will apply)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.proof.includes('Notarize')}
                                    onChange={(e) => handleCheckboxChange(formId, 'proof', 'Notarize', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">Notarize</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.noSpecialInstructions}
                            onChange={(e) => isMultiple
                                ? handleMultipleFormChange(formId, 'noSpecialInstructions', e.target.checked)
                                : handleSingleFormChange('noSpecialInstructions', e.target.checked)
                            }
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">No Special Instructions</span>
                    </label>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Special Instructions (This includes: Description of person being served, access codes, manager's phone numbers, suggested times for service, etc) :
                    </label>
                    <textarea
                        value={form.specialInstructions}
                        onChange={(e) => isMultiple
                            ? handleMultipleFormChange(formId, 'specialInstructions', e.target.value)
                            : handleSingleFormChange('specialInstructions', e.target.value)
                        }
                        placeholder="Special Instructions"
                        rows={4}
                        disabled={form.noSpecialInstructions}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Process Serving</h1>
                                <p className="text-sm text-gray-500">Serve information</p>
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
                    <div className="bg-gray-100 px-6 py-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-indigo-600">Serve Info</h2>
                            <button onClick={handleReset} className="text-sm text-indigo-600 hover:underline">
                                Reset Order
                            </button>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        {serveAllAtSameAddress ? (
                            <div>
                                <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between mb-6">
                                    <span className="font-semibold">Same Address For: All Servee</span>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <span className="text-sm">Serve All Parties at the same address</span>
                                        <input
                                            type="checkbox"
                                            checked={serveAllAtSameAddress}
                                            onChange={(e) => setServeAllAtSameAddress(e.target.checked)}
                                            className="w-5 h-5 rounded border-white"
                                        />
                                    </label>
                                </div>
                                {renderForm(singleForm)}
                            </div>
                        ) : (
                            <div>
                                {serveEntries.map((entry: any, index: number) => {
                                    const form = multipleForms.find(f => f.id === entry.id);
                                    return form ? (
                                        <div key={entry.id}>
                                            {renderForm(form, entry.name, entry.capacity, index === 0)}
                                            {index < serveEntries.length - 1 && (
                                                <div className="border-t border-gray-200 my-8"></div>
                                            )}
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        )}

                        {/* Serve and Capacity Table */}
                        <div className="mt-8 overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-indigo-600 text-white">
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Serve</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Capacity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {serveEntries.map((entry: any) => (
                                        <tr key={entry.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 text-sm text-gray-900">{entry.name}</td>
                                            <td className="px-6 py-3 text-sm text-gray-900">{entry.capacity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between rounded-b-xl">
                        <button
                            onClick={handleBack}
                            className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                        >
                            &lt; Back
                        </button>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveAndNext}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm"
                            >
                                Save & Next &gt;
                            </button>
                            <button className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm">
                                Save as Draft
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ServeInfo;