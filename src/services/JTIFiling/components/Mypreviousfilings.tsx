import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Search,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Filter,
    Loader2,
    AlertCircle,
    Eye
} from 'lucide-react';
import JTIHeader from './JTIHeader';
import { fetchCaseList } from '../caseApi';

interface Case {
    caseDocketId: string;
    caseTrackingId: string;
    caseTitle: string;
    caseCategoryText: string;
}

interface CaseListResponse {
    success: boolean;
    message: string;
    cases: Case[];
    totalCount: number;
    errors: string[];
    queriedAt: string;
}

interface FilterParams {
    courtOrganizationId: string;
    caseCategoryText: string;
    caseTypeText: string;
    caseDocketId: string;
    filedDateFrom: string;
    filedDateTo: string;
    participantName: string;
}

const MyPreviousFilings: React.FC = () => {
    const navigate = useNavigate();
    const [cases, setCases] = useState<Case[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const itemsPerPage = 10;

    // Filter states
    const [filters, setFilters] = useState<FilterParams>({
        courtOrganizationId: 'https://aux-pub-efm-madera-ca.ecourt.com/',
        caseCategoryText: '411900',
        caseTypeText: '421110',
        caseDocketId: '',
        filedDateFrom: '',
        filedDateTo: '',
        participantName: ''
    });

    const fetchCases = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchCaseList(filters);

            if (data.success) {
                setCases(data.cases || []);
                setTotalCount(data.totalCount);
            } else {
                setError(data.message || 'Failed to fetch cases');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching cases');
            console.error('Error fetching cases:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();
    }, []);

    // Pagination calculations
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCases = cases.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleFilterChange = (field: keyof FilterParams, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApplyFilters = () => {
        setCurrentPage(1);
        fetchCases();
        setShowFilters(false);
    };

    const handleResetFilters = () => {
        setFilters({
            courtOrganizationId: 'https://aux-pub-efm-madera-ca.ecourt.com/',
            caseCategoryText: '411900',
            caseTypeText: '421110',
            caseDocketId: '',
            filedDateFrom: '',
            filedDateTo: '',
            participantName: ''
        });
    };

    const handleViewCase = (caseItem: Case) => {
        // Navigate to case details page with caseTrackingId
        navigate(`/services/jti-filing/case-details/${caseItem.caseTrackingId}`);
    };

    // Pagination component
    const renderPagination = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${currentPage === i
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                >
                    {i}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <JTIHeader />

            {/* Main Content */}
            <main className="pt-24 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">My Previous Filings</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    View and manage your previously filed cases
                                </p>
                            </div>
                            <div className="hidden sm:block">
                                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-indigo-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="bg-white px-6 sm:px-8 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase">Total Cases</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                                </div>
                                <div className="h-12 w-px bg-gray-300"></div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase">Showing</p>
                                    <p className="text-2xl font-bold text-indigo-600">
                                        {Math.min(startIndex + 1, totalCount)}-{Math.min(endIndex, totalCount)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                <Filter className="w-4 h-4" />
                                <span className="hidden sm:inline">Filters</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="bg-gray-50 px-6 sm:px-8 py-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Cases</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Case Docket ID
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.caseDocketId}
                                        onChange={(e) => handleFilterChange('caseDocketId', e.target.value)}
                                        placeholder="Enter docket ID"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Participant Name
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.participantName}
                                        onChange={(e) => handleFilterChange('participantName', e.target.value)}
                                        placeholder="Enter participant name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Case Category
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.caseCategoryText}
                                        onChange={(e) => handleFilterChange('caseCategoryText', e.target.value)}
                                        placeholder="Enter category"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Filed Date From
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.filedDateFrom}
                                        onChange={(e) => handleFilterChange('filedDateFrom', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Filed Date To
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.filedDateTo}
                                        onChange={(e) => handleFilterChange('filedDateTo', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Case Type
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.caseTypeText}
                                        onChange={(e) => handleFilterChange('caseTypeText', e.target.value)}
                                        placeholder="Enter case type"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                                <button
                                    onClick={handleApplyFilters}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                                >
                                    Apply Filters
                                </button>
                                <button
                                    onClick={handleResetFilters}
                                    className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cases List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            <span className="ml-3 text-gray-600">Loading cases...</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                <p className="text-lg font-semibold text-gray-900 mb-1">Error Loading Cases</p>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <button
                                    onClick={fetchCases}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : currentCases.length === 0 ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-lg font-semibold text-gray-900 mb-1">No Cases Found</p>
                                <p className="text-gray-600">No previous filings match your search criteria</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Table Header - Desktop */}
                            <div className="hidden lg:grid lg:grid-cols-12 gap-4 bg-gray-50 px-6 py-3 border-b border-gray-200">
                                <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase">
                                    Docket ID
                                </div>
                                <div className="col-span-1 text-xs font-semibold text-gray-700 uppercase">
                                    Tracking ID
                                </div>
                                <div className="col-span-5 text-xs font-semibold text-gray-700 uppercase">
                                    Case Title
                                </div>
                                <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase">
                                    Category
                                </div>
                                <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase text-right">
                                    Actions
                                </div>
                            </div>

                            {/* Table Body */}
                            <div className="divide-y divide-gray-200">
                                {currentCases.map((caseItem, index) => (
                                    <div
                                        key={`${caseItem.caseDocketId}-${index}`}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        {/* Desktop View */}
                                        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 items-center">
                                            <div className="col-span-2">
                                                <p className="text-sm font-semibold text-indigo-600">
                                                    {caseItem.caseDocketId}
                                                </p>
                                            </div>
                                            <div className="col-span-1">
                                                <p className="text-sm text-gray-900">{caseItem.caseTrackingId}</p>
                                            </div>
                                            <div className="col-span-5">
                                                <p className="text-sm text-gray-900 font-medium line-clamp-2">
                                                    {caseItem.caseTitle}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    {caseItem.caseCategoryText}
                                                </span>
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <button
                                                    onClick={() => handleViewCase(caseItem)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mobile View */}
                                        <div className="lg:hidden px-4 py-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-indigo-600 mb-1">
                                                        {caseItem.caseDocketId}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Tracking: {caseItem.caseTrackingId}
                                                    </p>
                                                </div>
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    {caseItem.caseCategoryText}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-900 font-medium mb-3">
                                                {caseItem.caseTitle}
                                            </p>
                                            <button
                                                onClick={() => handleViewCase(caseItem)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Case Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t border-gray-200">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-gray-700">
                                            Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                                            <span className="font-semibold">{Math.min(endIndex, totalCount)}</span> of{' '}
                                            <span className="font-semibold">{totalCount}</span> results
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className={`p-2 rounded-lg border transition ${currentPage === 1
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                                    }`}
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>

                                            <div className="hidden sm:flex items-center gap-1">
                                                {renderPagination()}
                                            </div>

                                            <div className="sm:hidden">
                                                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className={`p-2 rounded-lg border transition ${currentPage === totalPages
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                                    }`}
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="mt-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg p-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Need to file a new case?</h3>
                    <p className="text-indigo-100 mb-4">
                        Start a new filing process or continue with an existing draft
                    </p>
                    <button
                        onClick={() => navigate('/services/jti-filing/new-case')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-50 transition shadow-md"
                    >
                        <FileText className="w-5 h-5" />
                        File a New Case
                    </button>
                </div>
            </main>
        </div>
    );
};

export default MyPreviousFilings;