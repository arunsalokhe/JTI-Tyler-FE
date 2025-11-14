// services/JTIFiling/caseService.ts

import { API_CONFIG } from './apiConfig';
import {
GetCaseRequest,
GetCaseResponse,
CodelistResponse
} from '../../types/jtiFilingTypes';

export const caseService = {
  /**
   * Fetch case details by case tracking ID
   */
  getCase: async (caseTrackingId: string): Promise<GetCaseResponse> => {
    const { USERNAME, PASSWORD } = API_CONFIG.FILING_CREDENTIALS;
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILING.GET_CASE(USERNAME, PASSWORD)}`;

    const requestBody: GetCaseRequest = {
      courtOrganizationId: "https://aux-pub-efm-madera-ca.ecourt.com/",
      caseTrackingId: caseTrackingId,
      includeParticipants: true,
      includeDocketEntry: true,
      includeCalendarEvent: false,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: API_CONFIG.FILING_HEADERS,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GetCaseResponse = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error fetching case:', error);
      throw error;
    }
  },

  /**
   * Fetch case type name by code
   */
  getCaseTypeName: async (code: string): Promise<CodelistResponse> => {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CODELIST.GET_CASE_TYPE(code)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CodelistResponse = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error fetching case type name:', error);
      throw error;
    }
  },

  /**
   * Fetch case category name by code
   */
  getCaseCategoryName: async (code: string): Promise<CodelistResponse> => {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CODELIST.GET_CASE_CATEGORY(code)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CodelistResponse = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error fetching case category name:', error);
      throw error;
    }
  },

  /**
   * Fetch case details with enriched names (case type and category names)
   */
  getCaseWithNames: async (caseTrackingId: string): Promise<GetCaseResponse & { enrichedData?: any }> => {
    try {
      // First, get the case details
      const caseData = await caseService.getCase(caseTrackingId);

      if (!caseData.success || !caseData.data) {
        return caseData;
      }

      // Fetch case type and category names in parallel
      const [caseTypeData, caseCategoryData] = await Promise.all([
        caseService.getCaseTypeName(caseData.data.caseDetails.caseType).catch(err => {
          console.warn('Failed to fetch case type name:', err);
          return null;
        }),
        caseService.getCaseCategoryName(caseData.data.caseDetails.caseCategory).catch(err => {
          console.warn('Failed to fetch case category name:', err);
          return null;
        }),
      ]);

      // Add enriched data to response
      return {
        ...caseData,
        enrichedData: {
          caseTypeName: caseTypeData?.name || caseData.data.caseDetails.caseType,
          caseTypeDescription: caseTypeData?.description || '',
          caseCategoryName: caseCategoryData?.name || caseData.data.caseDetails.caseCategory,
          caseCategoryDescription: caseCategoryData?.description || '',
        },
      };
    } catch (error: any) {
      console.error('Error fetching case with names:', error);
      throw error;
    }
  },
};