// utils/caseApi.ts
import { CaseListResponse, CaseListFilterParams } from '../../types/jtiFilingTypes';
import { API_CONFIG } from './apiConfig'; // Import your existing API config

/**
 * Fetch case list from the API
 * @param filters - Filter parameters for case search
 * @returns Promise with case list response
 */
export const fetchCaseList = async (
  filters: CaseListFilterParams
): Promise<CaseListResponse> => {
  try {
    const { USERNAME, PASSWORD } = API_CONFIG.FILING_CREDENTIALS;
    
    // Build the full URL using the endpoint configuration
    const endpoint = API_CONFIG.ENDPOINTS.CASE_LIST.GET_CASE_LIST(USERNAME, PASSWORD);
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    const requestBody = {
      courtOrganizationId: filters.courtOrganizationId,
      caseCategoryText: filters.caseCategoryText,
      caseTypeText: filters.caseTypeText,
      caseDocketId: filters.caseDocketId || 'string',
      filedDateFrom: filters.filedDateFrom || new Date().toISOString(),
      filedDateTo: filters.filedDateTo || new Date().toISOString(),
      participantName: filters.participantName || 'string'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'text/plain',
        'Content-Type': 'application/json-patch+json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CaseListResponse = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error fetching case list:', error);
    throw error;
  }
};

/**
 * Format date for API request (ISO format)
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDateForApi = (date: Date | string): string => {
  if (!date) return new Date().toISOString();
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
};

/**
 * Parse date from API response
 * @param dateString - ISO date string from API
 * @returns Formatted date string for display
 */
export const parseDateFromApi = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Get default filter parameters
 * @returns Default filter configuration
 */
export const getDefaultFilters = (): CaseListFilterParams => ({
  courtOrganizationId: 'https://aux-pub-efm-madera-ca.ecourt.com/',
  caseCategoryText: '411900',
  caseTypeText: '421110',
  caseDocketId: '',
  filedDateFrom: '',
  filedDateTo: '',
  participantName: ''
});

/**
 * Validate filter parameters
 * @param filters - Filter parameters to validate
 * @returns Validation result with errors if any
 */
export const validateFilters = (filters: CaseListFilterParams): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!filters.courtOrganizationId) {
    errors.push('Court Organization ID is required');
  }

  if (filters.filedDateFrom && filters.filedDateTo) {
    const fromDate = new Date(filters.filedDateFrom);
    const toDate = new Date(filters.filedDateTo);
    
    if (fromDate > toDate) {
      errors.push('Filed Date From must be before Filed Date To');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};