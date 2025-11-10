import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, FileText, AlertCircle, Loader2 } from 'lucide-react';
import JTIHeader from './JTIHeader';
import { jtiFilingService } from '../jtiFilingService';
import { ApiError } from '../apiConfig';
import { DocumentType } from '../../../types/jtiFilingTypes';

interface Document {
    id: string;
    isLeadDocument: boolean;
    documentType: string;
    documentTypeId: number | null;
    documentCode: string;
    file: File | null;
    fileName: string;
}

interface LocationState {
    caseTypeId?: string;
    caseData?: any;
    partyData?: any;
    partyWithFiledAsToData?: any;
}

const UploadDocuments: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    const [documents, setDocuments] = useState<Document[]>([
        {
            id: '1',
            isLeadDocument: true,
            documentType: '',
            documentTypeId: null,
            documentCode: '',
            file: null,
            fileName: ''
        }
    ]);

    const [leadDocumentTypes, setLeadDocumentTypes] = useState<DocumentType[]>([]);
    const [regularDocumentTypes, setRegularDocumentTypes] = useState<DocumentType[]>([]);
    const [isLoadingLead, setIsLoadingLead] = useState(true);
    const [isLoadingRegular, setIsLoadingRegular] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const caseTypeId = state?.caseTypeId || '421110'; // Default case type

    // Fetch Lead Document Types on mount
    useEffect(() => {
        fetchLeadDocumentTypes();
    }, [caseTypeId]);

    // Fetch Regular Document Types on mount
    useEffect(() => {
        fetchRegularDocumentTypes();
    }, [caseTypeId]);

    const fetchLeadDocumentTypes = async () => {
        setIsLoadingLead(true);
        setError(null);
        try {
            const data = await jtiFilingService.getLeadDocumentTypes(caseTypeId);
            setLeadDocumentTypes(data);

            // Set the first lead document type as default
            if (data.length > 0) {
                setDocuments(prev => prev.map(doc =>
                    doc.isLeadDocument
                        ? {
                            ...doc,
                            documentType: data[0].name,
                            documentTypeId: data[0].id,
                            documentCode: data[0].code
                        }
                        : doc
                ));
            }
        } catch (err) {
            console.error('Error fetching lead document types:', err);
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Failed to load lead document types');
            }
        } finally {
            setIsLoadingLead(false);
        }
    };

    const fetchRegularDocumentTypes = async () => {
        setIsLoadingRegular(true);
        try {
            const data = await jtiFilingService.getDocumentTypes(caseTypeId);
            setRegularDocumentTypes(data);
        } catch (err) {
            console.error('Error fetching regular document types:', err);
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Failed to load document types');
            }
        } finally {
            setIsLoadingRegular(false);
        }
    };

    const handleAddDocument = () => {
        if (regularDocumentTypes.length === 0) {
            alert('No document types available. Please try again later.');
            return;
        }

        const newDocument: Document = {
            id: Date.now().toString(),
            isLeadDocument: false,
            documentType: regularDocumentTypes[0].name,
            documentTypeId: regularDocumentTypes[0].id,
            documentCode: regularDocumentTypes[0].code,
            file: null,
            fileName: ''
        };
        setDocuments([...documents, newDocument]);
    };

    const handleRemoveDocument = (id: string) => {
        const docToRemove = documents.find(doc => doc.id === id);
        if (docToRemove?.isLeadDocument) {
            alert('Cannot remove the lead document');
            return;
        }
        setDocuments(documents.filter(doc => doc.id !== id));
    };

    const handleDocumentTypeChange = (id: string, value: string) => {
        const doc = documents.find(d => d.id === id);
        if (!doc) return;

        const selectedDocType = doc.isLeadDocument
            ? leadDocumentTypes.find(dt => dt.name === value)
            : regularDocumentTypes.find(dt => dt.name === value);

        setDocuments(documents.map(doc =>
            doc.id === id
                ? {
                    ...doc,
                    documentType: value,
                    documentTypeId: selectedDocType?.id || null,
                    documentCode: selectedDocType?.code || ''
                }
                : doc
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

            // Check file size (optional: limit to 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                alert('File size must be less than 10MB');
                return;
            }

            setDocuments(documents.map(doc =>
                doc.id === id ? { ...doc, file: file, fileName: file.name } : doc
            ));
        }
    };

    const handleBack = () => {
        // Navigate back with preserved state
        navigate('/services/jti-filing/add-PartyWithFiledAsTo', {
            state: {
                caseTypeId: state?.caseTypeId,
                caseData: state?.caseData,
                partyData: state?.partyData,
                partyWithFiledAsToData: state?.partyWithFiledAsToData
            }
        });
    };

    const handleCheckout = () => {
        // Validate all documents have files
        const allDocumentsValid = documents.every(doc => doc.file !== null);

        if (!allDocumentsValid) {
            alert('Please upload files for all documents before proceeding');
            return;
        }

        // Validate all documents have valid document types
        const allTypesValid = documents.every(doc => doc.documentTypeId !== null);
        if (!allTypesValid) {
            alert('Please select valid document types for all documents');
            return;
        }

        console.log('Documents to submit:', documents);

        // Prepare document data for checkout
        const documentData = documents.map(doc => ({
            id: doc.id,
            isLeadDocument: doc.isLeadDocument,
            documentType: doc.documentType,
            documentTypeId: doc.documentTypeId,
            documentCode: doc.documentCode,
            fileName: doc.fileName,
            fileSize: doc.file?.size,
            fileType: doc.file?.type
        }));

        // Navigate to checkout with all accumulated state
        navigate('/services/jti-filing/checkout', {
            state: {
                caseTypeId: state?.caseTypeId,
                caseData: state?.caseData,
                partyData: state?.partyData,
                partyWithFiledAsToData: state?.partyWithFiledAsToData,
                documentData: documentData,
                uploadedFiles: documents.map(doc => doc.file) // Pass actual files
            }
        });
    };

    if (isLoadingLead) {
        return (
            <div className="min-h-screen bg-gray-50">
                <JTIHeader />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading document types...</p>
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="space-y-6">

                    {/* Page Title */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents</h2>
                        <p className="text-gray-600">
                            Upload all required documents for your filing. All documents must be in PDF format and text-searchable.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-red-900 mb-1">Error</h4>
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents List */}
                    {documents.map((document, index) => (
                        <div key={document.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                            {/* Document Header */}
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Document {index + 1}
                                    </h3>
                                    {document.isLeadDocument && (
                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                                            Lead Document
                                        </span>
                                    )}
                                </div>
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
                                {/* Document Type Dropdown */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-900">
                                        {document.isLeadDocument ? 'Lead Document Type' : 'Document Type'}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={document.documentType}
                                        onChange={(e) => handleDocumentTypeChange(document.id, e.target.value)}
                                        disabled={document.isLeadDocument ? isLoadingLead : isLoadingRegular}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        {document.isLeadDocument ? (
                                            leadDocumentTypes.length === 0 ? (
                                                <option value="">No lead documents available</option>
                                            ) : (
                                                leadDocumentTypes.map((type) => (
                                                    <option key={type.id} value={type.name}>
                                                        {type.name}
                                                    </option>
                                                ))
                                            )
                                        ) : (
                                            regularDocumentTypes.length === 0 ? (
                                                <option value="">No documents available</option>
                                            ) : (
                                                regularDocumentTypes.map((type) => (
                                                    <option key={type.id} value={type.name}>
                                                        {type.name}
                                                    </option>
                                                ))
                                            )
                                        )}
                                    </select>
                                    {/* {document.documentCode && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Code: {document.documentCode}
                                        </p>
                                    )} */}
                                </div>

                                {/* File Upload */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-900">
                                        Upload PDF Document<span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id={`file-${document.id}`}
                                            accept=".pdf,application/pdf"
                                            onChange={(e) => handleFileChange(document.id, e)}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor={`file-${document.id}`}
                                            className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition bg-white"
                                        >
                                            {document.file ? (
                                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                    <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-sm font-medium text-gray-900 block truncate">
                                                            {document.fileName}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {(document.file.size / 1024 / 1024).toFixed(2)} MB
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">Choose a PDF file</span>
                                            )}
                                            <span className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded border border-gray-300 ml-4 flex-shrink-0">
                                                {document.file ? 'Change file' : 'Browse'}
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
                                <h4 className="text-sm font-bold text-gray-900 mb-1">Important: Searchable PDF Requirement</h4>
                                <p className="text-sm text-gray-700">
                                    All uploaded documents must be submitted as text-searchable PDF files. Court clerks may <strong>REJECT</strong> filings that do not comply with this requirement.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
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
                            onClick={handleAddDocument}
                            disabled={isLoadingRegular || regularDocumentTypes.length === 0}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoadingRegular ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Add Document
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleCheckout}
                            disabled={documents.some(doc => !doc.file)}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UploadDocuments;