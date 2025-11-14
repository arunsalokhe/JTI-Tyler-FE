/**
 * Barrel export for JTI Filing Service
 * Provides a single import point for all service-related exports
 */

// Export the main service
export { jtiFilingService, getCaseTypes, getCaseCategories, getJurisdictionalAmounts, getCaseDependentData } from './jtiFilingService';

// Export configuration and error class
export { API_CONFIG, ApiError } from './apiConfig';

// Export all types
export type {
  CaseType,
  CaseCategory,
  JurisdictionalAmount,
  CaseFormData,
  CaseTypesResponse,
  CaseCategoriesResponse,
  JurisdictionalAmountsResponse,
  ApiResponse,
  ApiErrorResponse,
} from '../../types/jtiFilingTypes';
