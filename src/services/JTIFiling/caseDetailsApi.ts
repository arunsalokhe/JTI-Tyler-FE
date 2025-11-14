// utils/caseDetailsApi.ts
import { GetCaseResponse, GetCaseRequest } from '../../types/Casedetailstypes';
import { API_CONFIG } from './apiConfig';

/**
 * Fetch detailed case information from the API
 * @param request - Request parameters for case details
 * @returns Promise with case details response
 */
export const fetchCaseDetails = async (
  request: GetCaseRequest
): Promise<GetCaseResponse> => {
  try {
    const { USERNAME, PASSWORD } = API_CONFIG.FILING_CREDENTIALS;
    
    // Build the full URL using the endpoint configuration
    const endpoint = API_CONFIG.ENDPOINTS.FILING.GET_CASE(USERNAME, PASSWORD);
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'text/plain',
        'Content-Type': 'application/json-patch+json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GetCaseResponse = await response.json();
    
    // Return the response as-is (including success: false cases)
    // The component will handle error cases appropriately
    return data;
  } catch (error) {
    console.error('Error fetching case details:', error);
    
    // Return a structured error response
    return {
      success: false,
      message: 'Failed to fetch case details',
      caseTrackingId: request.caseTrackingId,
      data: {
        caseDetails: {} as any,
        attorneys: [],
        parties: [],
        docketEntries: [],
        otherEntities: [],
        incidentAddress: {} as any,
        relatedCaseAssignments: []
      },
      queriedAt: new Date().toISOString()
    };
  }
};

/**
 * Get default request parameters for case details
 * @param caseTrackingId - The case tracking ID
 * @returns Default request configuration
 */
export const getDefaultCaseRequest = (caseTrackingId: string): GetCaseRequest => ({
  courtOrganizationId: 'https://aux-pub-efm-madera-ca.ecourt.com/',
  caseTrackingId: caseTrackingId,
  includeParticipants: true,
  includeDocketEntry: true,
  includeCalendarEvent: false
});

/**
 * Format date for display
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatCaseDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get status badge color based on case status
 * @param status - Case status
 * @returns Tailwind color classes
 */
export const getStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'OPEN':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'CLOSED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'DISMISSED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};