import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2 } from 'lucide-react';

interface CaseData {
    eFilingTitle: string;
    caseType: string;
    caseCategory: string;
    jurisdictionalAmount: string;
    demandAmount: string;
}

interface Party {
    role: string;
    name: string;
    address: string;
    email: string;
}

interface Document {
    name: string;
    fileName: string;
    fileSize: string;
}

const Checkout: React.FC = () => {
    const navigate = useNavigate();

    // Sample data - in real app, this would come from state management or props
    const [caseData] = useState<CaseData>({
        eFilingTitle: 'test',
        caseType: 'Civil Limited',
        caseCategory: 'Abstract of Judgment',
        jurisdictionalAmount: 'Over $10,000 and up to $35,000',
        demandAmount: '$4.44'
    });

    const [filedByParties] = useState<Party[]>([
        {
            role: 'Plaintiff - P',
            name: 'Sumit S. Ghorpade',
            address: '276 Cedarhurst Avenue\nCedarhurst CA 11516',
            email: 'cwptest1208@gmail.com'
        }
    ]);

    const [filedAsToParties] = useState<Party[]>([
        {
            role: 'Defendant - P',
            name: 'Sumit S. Ghorpade',
            address: '',
            email: ''
        }
    ]);

    const [documents] = useState<Document[]>([
        {
            name: 'Out of County Abstract',
            fileName: '1.pdf',
            fileSize: '181208kb'
        }
    ]);

    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [messageToClerk, setMessageToClerk] = useState<string>('');

    const paymentMethods = [
        'Credit Card',
        'Debit Card',
        'Bank Account',
        'Firm Account'
    ];

    const handleEdit = (section: string) => {
        console.log(`Editing ${section}`);
        // Navigate to appropriate edit page
        switch (section) {
            case 'case':
                navigate('/services/jti-filing/add-party');
                break;
            case 'parties':
                navigate('/services/jti-filing/add-party');
                break;
            case 'documents':
                navigate('/services/jti-filing/upload-documents');
                break;
        }
    };

    const handleSubmit = () => {
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }

        console.log('Submitting filing:', {
            caseData,
            filedByParties,
            filedAsToParties,
            documents,
            paymentMethod,
            messageToClerk
        });

        alert('Filing submitted successfully!');
        navigate('/jti-filing/confirmation');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Checkout
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="space-y-6">
                    {/* Case Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Case</h2>
                            <button
                                onClick={() => handleEdit('case')}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                            >
                                Edit
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-600">eFiling Title:</span>
                                <p className="text-sm font-medium text-gray-900">{caseData.eFilingTitle}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Case Type:</span>
                                <p className="text-sm font-medium text-gray-900">{caseData.caseType}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Case Category:</span>
                                <p className="text-sm font-medium text-gray-900">{caseData.caseCategory}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Jurisdictional Amount:</span>
                                <p className="text-sm font-medium text-gray-900">{caseData.jurisdictionalAmount}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Demand Amount:</span>
                                <p className="text-sm font-medium text-gray-900">{caseData.demandAmount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Parties Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Parties</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Filed By */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Filed By</h3>
                                    {filedByParties.map((party, index) => (
                                        <div key={index} className="mb-4">
                                            <p className="text-sm text-gray-900 mb-1">
                                                <a href="#" className="text-blue-600 hover:underline">{party.role}</a>
                                                {' '}
                                                <a href="#" className="text-blue-600 hover:underline">(Edit)</a>
                                            </p>
                                            <p className="text-sm text-gray-900">{party.name}</p>
                                            <p className="text-sm text-gray-600">M Address:</p>
                                            <p className="text-sm text-gray-900 whitespace-pre-line">{party.address}</p>
                                            <p className="text-sm text-gray-600 mt-1">Primary Email - {party.email}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Filed As To */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Filed As To</h3>
                                    {filedAsToParties.map((party, index) => (
                                        <div key={index} className="mb-4">
                                            <p className="text-sm text-gray-900 mb-1">
                                                <a href="#" className="text-blue-600 hover:underline">{party.role}</a>
                                                {' '}
                                                <a href="#" className="text-blue-600 hover:underline">(Edit)</a>
                                            </p>
                                            <p className="text-sm text-gray-900">{party.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Documents</h2>
                            <button
                                onClick={() => handleEdit('documents')}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                            >
                                Edit
                            </button>
                        </div>
                        <div className="p-6">
                            {documents.map((doc, index) => (
                                <div key={index} className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-900">{doc.name}</span>
                                    <span className="text-sm text-gray-600">{doc.fileName} - {doc.fileSize}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Automatic Payment Method Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Automatic Payment Method</h2>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm text-gray-900 mb-3">
                                Please select your payment method:<span className="text-red-500">*</span>
                            </label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
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
                            <h2 className="text-lg font-bold text-gray-900">Estimated Fees</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600">Please fill out all required fields.</p>
                        </div>
                    </div>

                    {/* Message to Clerk Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Message to Clerk</h2>
                        </div>
                        <div className="p-6">
                            <textarea
                                value={messageToClerk}
                                onChange={(e) => setMessageToClerk(e.target.value)}
                                rows={4}
                                placeholder="Enter any message or notes for the clerk..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end pt-6">
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-sm"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;