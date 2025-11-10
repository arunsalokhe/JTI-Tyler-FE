// services/JTIFiling/caseService.ts

import { API_CONFIG } from './apiConfig';
import {
GetCaseRequest,
GetCaseResponse
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
};