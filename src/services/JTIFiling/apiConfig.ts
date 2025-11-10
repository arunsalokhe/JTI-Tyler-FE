/**
 * API Configuration
 * Central configuration for all API calls
 */

export const API_CONFIG = {
  BASE_URL: 'https://localhost:7207/api',
  //BASE_URL: 'https://localhost:7207/api', 
  ENDPOINTS: {
    MADERA_COURT: {
      CASE_TYPES: '/MaderaCourt/case-types',
      CASE_CATEGORIES: (caseTypeCode: string) => `/MaderaCourt/case-categories/${caseTypeCode}`,
      JURISDICTIONAL_AMOUNTS: (caseTypeCode: string) => `/MaderaCourt/jurisdictional-amounts/${caseTypeCode}`,
      PARTY_TYPES: (caseCategoryCode: string) => `/MaderaCourt/case-category-party-types/${caseCategoryCode}`,
      PARTY_DESIGNATION_TYPES: '/MaderaCourt/GetPartyDesignationTypes',
      LANGUAGES: '/MaderaCourt/GetAllLanguages',
      COUNTRIES: '/MaderaCourt/GetAllCountries',
      US_STATES: '/MaderaCourt/GetAllUSStates',
      AKA_TYPES: '/MaderaCourt/GetAllAKATypes',
      // Document endpoints
      LEAD_DOCUMENT_TYPES: (caseTypeCode: string) => `/MaderaCourt/GetDocumentListsByLeadCaseType/${caseTypeCode}`,
      DOCUMENT_TYPES: (caseTypeCode: string) => `/MaderaCourt/GetDocumentListsByCaseType/${caseTypeCode}`,
      SUBSEQUENT_DOCUMENT_TYPES: (caseTypeCode: string) => `/MaderaCourt/GetDocumentListsBySubSequentCaseType/${caseTypeCode}`,
    },
    // Filing submission endpoint
    FILING: {
      SUBMIT_CIVIL_FILING: (userName: string, password: string) => 
        `/Dynamiccivilfiling/SubmitCivilFilingnew_Final_Dynamic?userName=${userName}&password=${encodeURIComponent(password)}`,
      GET_CASE: (userName: string, password: string) =>
        `/CaseList/GetCase?userName=${encodeURIComponent(userName)}&password=${encodeURIComponent(password)}`,
    },
  },
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  FILING_HEADERS: {
    'accept': '*/*',
    'Content-Type': 'application/json-patch+json'
  },
  TIMEOUT: 30000, // 30 seconds
  // Filing credentials
  FILING_CREDENTIALS: {
    USERNAME: 'countrywide',
    PASSWORD: 'O2Nug>O6qrG9'
  }
};

/**
 * API Error class for better error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}