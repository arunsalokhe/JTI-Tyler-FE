import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, Trash2, FileText, AlertCircle, Loader2, Calendar, Hash, FileType } from 'lucide-react';
import JTIHeader from './JTIHeader';
import { jtiFilingService } from '../jtiFilingService';
import { ApiError } from '../apiConfig';
import { DocumentType } from '../../../types/jtiFilingTypes';

interface Document {
    id: string;
    documentType: string;
    documentTypeId: number | null;
    documentCode: string;
    file: File | null;
    fileName: string;
}

interface DocketEntry {
    documentId: string;
    description: string;
    entryDate: string;
}

interface LocationState {
    caseData?: any;
    parties?: any[];
    isSubsequentFiling?: boolean;
}

const SubsequentDocument: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    const [documents, setDocuments] = useState<Document[]>([]);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [docketEntries, setDocketEntries] = useState<DocketEntry[]>([]);
    const [isLoadingDocTypes, setIsLoadingDocTypes] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const caseTypeId = state?.caseData?.caseType || '';
    const caseTrackingId = state?.caseData?.caseTrackingId || '';

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDocketEntries = docketEntries.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(docketEntries.length / itemsPerPage);

    useEffect(() => {
        if (!state?.caseData) {
            console.error('No case data found');
            navigate('/services/jti-filing/subsequent-filing');
            return;
        }

        // Extract docket entries from API data
        const apiDocketEntries = state?.caseData?.subsequentFilingData?.rawApiData?.docketEntries || [];
        setDocketEntries(apiDocketEntries);

        // Fetch document types
        fetchSubsequentDocumentTypes();
    }, []);

    const fetchSubsequentDocumentTypes = async () => {
        setIsLoadingDocTypes(true);
        setError(null);
        try {
            console.log('Fetching subsequent document types for case type:', caseTypeId);
            const data = await jtiFilingService.getSubsequentDocumentTypes(caseTypeId);
            setDocumentTypes(data);
            console.log('✅ Loaded document types:', data.length);

            // Add first document automatically with first document type
            if (data.length > 0) {
                const firstDoc: Document = {
                    id: Date.now().toString(),
                    documentType: data[0].name,
                    documentTypeId: data[0].id,
                    documentCode: data[0].code,
                    file: null,
                    fileName: ''
                };
                setDocuments([firstDoc]);
            }
        } catch (err) {
            console.error('Error fetching subsequent document types:', err);
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Failed to load document types');
            }
        } finally {
            setIsLoadingDocTypes(false);
        }
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        // Scroll to table top
        const tableElement = document.getElementById('document-history-table');
        if (tableElement) {
            tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const getPageNumbers = () => {
        const pageNumbers: (number | string)[] = [];
        const maxPagesToShow = 5;
        
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            
            if (currentPage > 3) {
                pageNumbers.push('...');
            }
            
            const startPage = Math.max(2, currentPage - 1);
            const endPage = Math.min(totalPages - 1, currentPage + 1);
            
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
            
            if (currentPage < totalPages - 2) {
                pageNumbers.push('...');
            }
            
            pageNumbers.push(totalPages);
        }
        
        return pageNumbers;
    };

    const handleAddDocument = () => {
        if (documentTypes.length === 0) {
            alert('No document types available. Please try again later.');
            return;
        }

        const newDocument: Document = {
            id: Date.now().toString(),
            documentType: documentTypes[0].name,
            documentTypeId: documentTypes[0].id,
            documentCode: documentTypes[0].code,
            file: null,
            fileName: ''
        };
        setDocuments([...documents, newDocument]);
    };

    const handleRemoveDocument = (id: string) => {
        if (documents.length === 1) {
            alert('At least one document is required');
            return;
        }
        setDocuments(documents.filter(doc => doc.id !== id));
    };

    const handleDocumentTypeChange = (id: string, value: string) => {
        const selectedDocType = documentTypes.find(dt => dt.name === value);

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
            if (file.type !== 'application/pdf') {
                alert('Please upload only PDF files');
                return;
            }

            const maxSize = 10 * 1024 * 1024;
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
        navigate('/services/jti-filing/subsequent-party', {
            state: state
        });
    };

    const handleCheckout = () => {
        const allDocumentsValid = documents.every(doc => doc.file !== null);

        if (!allDocumentsValid) {
            alert('Please upload files for all documents before proceeding');
            return;
        }

        const allTypesValid = documents.every(doc => doc.documentTypeId !== null);
        if (!allTypesValid) {
            alert('Please select valid document types for all documents');
            return;
        }

        console.log('Documents to submit:', documents);

        const documentData = documents.map(doc => ({
            id: doc.id,
            documentType: doc.documentType,
            documentTypeId: doc.documentTypeId,
            documentCode: doc.documentCode,
            fileName: doc.fileName,
            fileSize: doc.file?.size,
            fileType: doc.file?.type
        }));

        navigate('/services/jti-filing/subsequent-checkout', {
            state: {
                ...state,
                documentData: documentData,
                uploadedFiles: documents.map(doc => doc.file)
            }
        });
    };

    if (isLoadingDocTypes) {
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
            <JTIHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="space-y-6">
                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h4 className="text-sm font-semibold text-blue-900 mb-1">Subsequent Filing - Document Upload</h4>
                                <p className="text-sm text-blue-800">
                                    You are adding documents to case <strong>{caseTrackingId}</strong>. Review the existing document history below and upload your new documents.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Case Summary */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">Case Title</p>
                                <p className="text-sm font-semibold text-gray-900">{state?.caseData?.eFilingTitle || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Case Docket ID</p>
                                <p className="text-sm font-semibold text-gray-900">{state?.caseData?.caseDocketId || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Case Type</p>
                                <p className="text-sm font-semibold text-gray-900">{state?.caseData?.selectedCaseType?.name || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Existing Document History with Pagination */}
                    {docketEntries.length > 0 && (
                        <div id="document-history-table" className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Existing Document History</h3>
                                        <p className="text-sm text-gray-600 mt-1">Previously filed documents in this case</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Total Documents</p>
                                        <p className="text-2xl font-bold text-gray-900">{docketEntries.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <Hash className="w-4 h-4" />
                                                        Document ID
                                                    </div>
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <FileType className="w-4 h-4" />
                                                        Description
                                                    </div>
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        Entry Date
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {currentDocketEntries.map((entry, index) => (
                                                <tr key={`${entry.documentId}-${indexOfFirstItem + index}`} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {entry.documentId}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {entry.description}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                        {new Date(entry.entryDate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-4">
                                        {/* Showing X to Y of Z results */}
                                        <div className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                                            <span className="font-medium">
                                                {Math.min(indexOfLastItem, docketEntries.length)}
                                            </span>{' '}
                                            of <span className="font-medium">{docketEntries.length}</span> documents
                                        </div>

                                        {/* Pagination Buttons */}
                                        <div className="flex items-center gap-2">
                                            {/* Previous Button */}
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                title="Previous page"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>

                                            {/* Page Numbers */}
                                            <div className="hidden sm:flex items-center gap-1">
                                                {getPageNumbers().map((pageNum, idx) => (
                                                    pageNum === '...' ? (
                                                        <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500">
                                                            ...
                                                        </span>
                                                    ) : (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum as number)}
                                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                                                                currentPage === pageNum
                                                                    ? 'bg-indigo-600 text-white'
                                                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    )
                                                ))}
                                            </div>

                                            {/* Mobile: Just show current page */}
                                            <div className="sm:hidden px-4 py-2 text-sm font-medium text-gray-700">
                                                Page {currentPage} of {totalPages}
                                            </div>

                                            {/* Next Button */}
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                title="Next page"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Page Title */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload New Documents</h2>
                        <p className="text-gray-600">
                            Upload all required documents for your subsequent filing. All documents must be in PDF format and text-searchable.
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

                    {/* New Documents List */}
                    {documents.map((document, index) => (
                        <div key={document.id} className="bg-white rounded-xl shadow-sm border-2 border-indigo-200">
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-indigo-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        New Document #{index + 1}
                                    </h3>
                                </div>
                                {documents.length > 1 && (
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
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-900">
                                        Document Type<span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={document.documentType}
                                        onChange={(e) => handleDocumentTypeChange(document.id, e.target.value)}
                                        disabled={isLoadingDocTypes}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        {documentTypes.length === 0 ? (
                                            <option value="">No document types available</option>
                                        ) : (
                                            documentTypes.map((type) => (
                                                <option key={type.id} value={type.name}>
                                                    {type.name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

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
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>

                        <button
                            onClick={handleAddDocument}
                            disabled={isLoadingDocTypes || documentTypes.length === 0}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoadingDocTypes ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Add Another Document
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleCheckout}
                            disabled={documents.some(doc => !doc.file)}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Proceed to Checkout
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SubsequentDocument;