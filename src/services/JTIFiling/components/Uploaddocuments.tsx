import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Upload, Trash2, FileText, AlertCircle } from 'lucide-react';

interface Document {
    id: string;
    isLeadDocument: boolean;
    documentType: string;
    file: File | null;
    fileName: string;
}

const UploadDocuments: React.FC = () => {
    const navigate = useNavigate();

    const [documents, setDocuments] = useState<Document[]>([
        {
            id: '1',
            isLeadDocument: true,
            documentType: 'Order for Coordination',
            file: null,
            fileName: ''
        }
    ]);

    const leadDocumentTypes = [
        'Order for Coordination',
        'Out of County Abstract',
        'Complaint',
        'Petition',
        'Motion',
        'Answer',
        'Declaration',
        'Summons',
        'Notice',
        'Order',
        'Other'
    ];

    const documentTypes = [
        'Appeal - Ordered Stayed (Bankruptcy)',
        'Affidavit',
        'Answer',
        'Application',
        'Certificate',
        'Complaint',
        'Declaration',
        'Exhibit',
        'Motion',
        'Notice',
        'Order',
        'Petition',
        'Proof of Service',
        'Request',
        'Summons',
        'Other'
    ];

    const handleAddDocument = () => {
        const newDocument: Document = {
            id: Date.now().toString(),
            isLeadDocument: false,
            documentType: 'Appeal - Ordered Stayed (Bankruptcy)',
            file: null,
            fileName: ''
        };
        setDocuments([...documents, newDocument]);
    };

    const handleRemoveDocument = (id: string) => {
        // Don't allow removing the lead document
        const docToRemove = documents.find(doc => doc.id === id);
        if (docToRemove?.isLeadDocument) {
            alert('Cannot remove the lead document');
            return;
        }
        setDocuments(documents.filter(doc => doc.id !== id));
    };

    const handleDocumentTypeChange = (id: string, value: string) => {
        setDocuments(documents.map(doc =>
            doc.id === id ? { ...doc, documentType: value } : doc
        ));
    };

    const handleFileChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check if file is PDF
            if (file.type !== 'application/pdf') {
                alert('Please upload only PDF files');
                return;
            }

            setDocuments(documents.map(doc =>
                doc.id === id ? { ...doc, file: file, fileName: file.name } : doc
            ));
        }
    };

    const handleCheckout = () => {
        // Validate all documents have files
        const allDocumentsValid = documents.every(doc => doc.file !== null);

        if (!allDocumentsValid) {
            alert('Please upload files for all documents before proceeding');
            return;
        }

        console.log('Documents to submit:', documents);
        //alert('Documents uploaded successfully! Proceeding to checkout...');
        // Navigate to next step or checkout
        navigate('/services/jti-filing/checkout');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">JTI E-Filing</h1>
                                <p className="text-sm text-gray-500">Upload documents for filing</p>
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

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="space-y-6">
                    {/* Documents List */}
                    {documents.map((document, index) => (
                        <div key={document.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                            {/* Document Header */}
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Document {index + 1}
                                </h3>
                                {!document.isLeadDocument && (
                                    <button
                                        onClick={() => handleRemoveDocument(document.id)}
                                        className="p-2 hover:bg-white rounded-lg transition text-red-600"
                                        title="Remove document"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="p-6 sm:p-8 space-y-6">
                                {/* Document Type - Different label based on if it's lead or not */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-900">
                                        {document.isLeadDocument ? 'Lead Document' : 'Document Type'}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={document.documentType}
                                        onChange={(e) => handleDocumentTypeChange(document.id, e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                                    >
                                        {document.isLeadDocument ? (
                                            leadDocumentTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))
                                        ) : (
                                            documentTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                {/* File Upload */}
                                <div className="space-y-2">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id={`file-${document.id}`}
                                            accept=".pdf"
                                            onChange={(e) => handleFileChange(document.id, e)}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor={`file-${document.id}`}
                                            className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition bg-white"
                                        >
                                            {document.file ? (
                                                <div className="flex items-center space-x-3">
                                                    <FileText className="w-5 h-5 text-indigo-600" />
                                                    <span className="text-sm font-medium text-gray-900">{document.fileName}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">No file chosen</span>
                                            )}
                                            <span className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded border border-gray-300">
                                                Choose file
                                            </span>
                                        </label>
                                    </div>

                                    {document.file && (
                                        <div className="flex items-center space-x-2 text-sm text-green-600">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span>File uploaded successfully</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Searchable PDF Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-1">Searchable PDF</h4>
                                <p className="text-sm text-gray-700">
                                    Upload documents must be submitted's as text searchable PDF documents. Court clerks may REJECT filing that do not comply with this mandate.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                        <button
                            onClick={handleAddDocument}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                        >
                            <Upload className="w-5 h-5" />
                            Add Document
                        </button>

                        <button
                            onClick={handleCheckout}
                            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Checkout
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UploadDocuments;