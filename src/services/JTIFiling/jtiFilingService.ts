/**
 * JTI E-Filing API Service
 * Centralized API calls with error handling, retry logic, and standard responses
 */

import { API_CONFIG, ApiError } from './apiConfig';
import {
  CaseTypesResponse,
  CaseCategoriesResponse,
  JurisdictionalAmountsResponse,
  PartyTypesResponse,
  PartyDesignationTypesResponse,
  LanguagesResponse,
  CountriesResponse,
  USStatesResponse,
  AKATypesResponse,
  LeadDocumentTypesResponse,
  DocumentTypesResponse,
  SubsequentDocumentTypesResponse,
} from '../../types/jtiFilingTypes';


/**
 * Generic fetch wrapper with error handling and timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_CONFIG.TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...API_CONFIG.HEADERS,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout - please try again', 408);
    }
    
    throw error;
  }
}

/**
 * Handle API response and errors
 */
async function handleApiResponse<T>(response: Response): Promise<T> {
  // Handle successful responses
  if (response.ok) {
    try {
      const data = await response.json();
      return data as T;
    } catch (error) {
      throw new ApiError('Failed to parse response', response.status);
    }
  }

  // Handle error responses
  let errorMessage = 'An error occurred';
  let errorData: any = null;

  try {
    errorData = await response.json();
    errorMessage = errorData.message || errorData.title || errorMessage;
  } catch {
    // If response is not JSON, use status text
    errorMessage = response.statusText || errorMessage;
  }

  throw new ApiError(errorMessage, response.status, errorData);
}

/**
 * JTI Filing API Service
 */
export const jtiFilingService = {
  /**
   * Fetch all case types
   * @returns Promise with case types data
   */
  getCaseTypes: async (): Promise<CaseTypesResponse> => {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MADERA_COURT.CASE_TYPES}`;
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
      });

      return await handleApiResponse<CaseTypesResponse>(response);
    } catch (error: any) {
      console.error('Error fetching case types:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Failed to fetch case types. Please check your connection and try again.',
        undefined,
        error
      );
    }
  },

  /**
   * Fetch case categories for a specific case type
   * @param caseTypeCode - The case type code
   * @returns Promise with case categories data
   */
  getCaseCategories: async (caseTypeCode: string): Promise<CaseCategoriesResponse> => {
    if (!caseTypeCode) {
      throw new ApiError('Case type code is required', 400);
    }

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MADERA_COURT.CASE_CATEGORIES(caseTypeCode)}`;
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
      });

      return await handleApiResponse<CaseCategoriesResponse>(response);
    } catch (error: any) {
      console.error(`Error fetching case categories for ${caseTypeCode}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Failed to fetch case categories. Please try again.',
        undefined,
        error
      );
    }
  },

  /**
   * Fetch jurisdictional amounts for a specific case type
   * @param caseTypeCode - The case type code
   * @returns Promise with jurisdictional amounts data
   */
  getJurisdictionalAmounts: async (caseTypeCode: string): Promise<JurisdictionalAmountsResponse> => {
    if (!caseTypeCode) {
      throw new ApiError('Case type code is required', 400);
    }

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MADERA_COURT.JURISDICTIONAL_AMOUNTS(caseTypeCode)}`;
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
      });

      return await handleApiResponse<JurisdictionalAmountsResponse>(response);
    } catch (error: any) {
      console.error(`Error fetching jurisdictional amounts for ${caseTypeCode}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Failed to fetch jurisdictional amounts. Please try again.',
        undefined,
        error
      );
    }
  },

  /**
   * Fetch both case categories and jurisdictional amounts in parallel
   * This is useful when case type changes and we need both data sets
   * @param caseTypeCode - The case type code
   * @returns Promise with both categories and jurisdictional amounts
   */
  getCaseDependentData: async (caseTypeCode: string) => {
    try {
      const [categories, amounts] = await Promise.all([
        jtiFilingService.getCaseCategories(caseTypeCode),
        jtiFilingService.getJurisdictionalAmounts(caseTypeCode),
      ]);

      return {
        categories,
        amounts,
      };
    } catch (error: any) {
      console.error(`Error fetching dependent data for ${caseTypeCode}:`, error);
      throw error;
    }
  },

  /**
   * Fetch party types for a specific case category
   * @param caseCategoryCode - The case category code
   * @returns Promise with party types data
   */
  getPartyTypes: async (caseCategoryCode: string): Promise<PartyTypesResponse> => {
    if (!caseCategoryCode) {
      throw new ApiError('Case category code is required', 400);
    }

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MADERA_COURT.PARTY_TYPES(caseCategoryCode)}`;
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
      });

      return await handleApiResponse<PartyTypesResponse>(response);
    } catch (error: any) {
      console.error(`Error fetching party types for ${caseCategoryCode}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Failed to fetch party types. Please try again.',
        undefined,
        error
      );
    }
  },

  /**
   * Fetch all party designation types
   * @returns Promise with party designation types data
   */
  getPartyDesignationTypes: async (): Promise<PartyDesignationTypesResponse> => {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MADERA_COURT.PARTY_DESIGNATION_TYPES}`;
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
      });

      return await handleApiResponse<PartyDesignationTypesResponse>(response);
    } catch (error: any) {
      console.error('Error fetching party designation types:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Failed to fetch party designation types. Please try again.',
        undefined,
        error
      );
    }
  },

  /**
   * Fetch all languages
   * @returns Promise with languages data
   */
  getLanguages: async (): Promise<LanguagesResponse> => {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MADERA_COURT.LANGUAGES}`;
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
      });

      return await handleApiResponse<LanguagesResponse>(response);
    } catch (error: any) {
      console.error('Error fetching languages:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Failed to fetch languages. Please try again.',
        undefined,
        error
      );
    }
  },

  /**
   * Fetch all countries
   * @returns Promise with countries data
   */
  getCountries: async (): Promise<CountriesResponse> => {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MADERA_COURT.COUNTRIES}`;
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
      });

      return await handleApiResponse<CountriesResponse>(response);
    } catch (error: any) {
      console.error('Error fetching countries:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Failed to fetch countries. Please try again.',
        undefined,
        error
      );
    }
  },

  /**
   * Fetch all US states
   * @returns Promise with US states data
   */
  getUSStates: async (): Promise<USStatesResponse> => {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MADERA_COURT.US_STATES}`;
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
      });

      return await handleApiResponse<USStatesResponse>(response);
    } catch (error: any) {
      console.error('Error fetching US states:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Failed to fetch US states. Please try again.',
        undefined,
        error
      );
    }
  },

  /**
   * Fetch all AKA types
   * @returns Promise with AKA types data
   */
  getAKATypes: async (): Promise<AKATypesResponse> => {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MADERA_COURT.AKA_TYPES}`;
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
      });

      return await handleApiResponse<AKATypesResponse>(response);
    } catch (error: any) {
      console.error('Error fetching AKA types:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Failed to fetch AKA types. Please try again.',
        undefined,
        error
      );
    }
  },

  /**
   * Fetch lead document types for a specific case type
   * @param caseTypeCode - The case type code
   * @returns Promise with lead document types data
   */
  getLeadDocumentTypes: async (caseTypeCode: string): Promise<LeadDocumentTypesResponse> => {
    if (!caseTypeCode) {
      throw new ApiError('Case type code is required', 400);
    }

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MADERA_COURT.LEAD_DOCUMENT_TYPES(caseTypeCode)}`;
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
      });

      return await handleApiResponse<LeadDocumentTypesResponse>(response);
    } catch (error: any) {
      console.error(`Error fetching lead document types for ${caseTypeCode}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Failed to fetch lead document types. Please try again.',
        undefined,
        error
      );
    }
  },

  /**
   * Fetch regular document types for a specific case type
   * @param caseTypeCode - The case type code
   * @returns Promise with document types data
   */
  getDocumentTypes: async (caseTypeCode: string): Promise<DocumentTypesResponse> => {
    if (!caseTypeCode) {
      throw new ApiError('Case type code is required', 400);
    }

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MADERA_COURT.DOCUMENT_TYPES(caseTypeCode)}`;
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
      });

      return await handleApiResponse<DocumentTypesResponse>(response);
    } catch (error: any) {
      console.error(`Error fetching document types for ${caseTypeCode}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Failed to fetch document types. Please try again.',
        undefined,
        error
      );
    }
  },

  /**
   * Fetch subsequent document types for a specific case type
   * @param caseTypeCode - The case type code
   * @returns Promise with subsequent document types data
   */
  getSubsequentDocumentTypes: async (caseTypeCode: string): Promise<SubsequentDocumentTypesResponse> => {
    if (!caseTypeCode) {
      throw new ApiError('Case type code is required', 400);
    }

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MADERA_COURT.SUBSEQUENT_DOCUMENT_TYPES(caseTypeCode)}`;
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
      });

      return await handleApiResponse<SubsequentDocumentTypesResponse>(response);
    } catch (error: any) {
      console.error(`Error fetching subsequent document types for ${caseTypeCode}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Failed to fetch subsequent document types. Please try again.',
        undefined,
        error
      );
    }
  },

  /**
   * Fetch both lead and regular document types in parallel
   * @param caseTypeCode - The case type code
   * @returns Promise with both lead and regular document types
   */
  getDocumentTypesData: async (caseTypeCode: string) => {
    try {
      const [leadDocuments, regularDocuments] = await Promise.all([
        jtiFilingService.getLeadDocumentTypes(caseTypeCode),
        jtiFilingService.getDocumentTypes(caseTypeCode),
      ]);

      return {
        leadDocuments,
        regularDocuments,
      };
    } catch (error: any) {
      console.error(`Error fetching document types data for ${caseTypeCode}:`, error);
      throw error;
    }
  },
};

/**
 * Export individual functions for direct import if needed
 */
export const { 
  getCaseTypes, 
  getCaseCategories, 
  getJurisdictionalAmounts, 
  getCaseDependentData,
  getPartyTypes,
  getPartyDesignationTypes,
  getLanguages,
  getCountries,
  getUSStates,
  getAKATypes,
  getLeadDocumentTypes,
  getDocumentTypes,
  getSubsequentDocumentTypes,
  getDocumentTypesData,
} = jtiFilingService;