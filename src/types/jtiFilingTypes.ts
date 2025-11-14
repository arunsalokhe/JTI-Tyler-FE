/**
 * Type Definitions for JTI E-Filing API
 * All interfaces and types used across the application
 */

// ==================== Case Types ====================
export interface CaseType {
  code: string;
  name: string;
}

export interface CaseTypesResponse {
  caseTypes: CaseType[];
  totalCaseTypes: number;
}

// ==================== Case Categories ====================
export interface CaseCategory {
  code: string;
  name: string;
  description: string;
}

export interface CaseCategoriesResponse {
  caseType: {
    code: string;
    name: string;
  };
  relatedCategories: CaseCategory[];
  totalRelatedCategories: number;
  hasRelatedCategories: boolean;
}

// ==================== Jurisdictional Amounts ====================
export interface JurisdictionalAmount {
  code: string;
  name: string;
  description: string;
}

export type JurisdictionalAmountsResponse = JurisdictionalAmount[];

// ==================== Case Data ====================
export interface CaseFormData {
  eFilingTitle: string;
  caseType: string;
  caseCategory: string;
  jurisdictionalAmount: string;
  demandAmount?: string;
}

// ==================== Party Types ====================
export interface PartyType {
  code: string;
  name: string;
  description: string;
}

export interface PartyTypesResponse {
  caseCategory: {
    code: string;
    name: string;
    description: string;
  };
  partyTypes: PartyType[];
  totalPartyTypes: number;
  hasPartyTypes: boolean;
}

// ==================== Party Designation Types ====================
export interface PartyDesignationType {
  code: string;
  name: string;
  description: string;
}

export type PartyDesignationTypesResponse = PartyDesignationType[];

// ==================== Languages ====================
export interface Language {
  code: string;
  name: string;
  description: string;
}

export type LanguagesResponse = Language[];

// ==================== Countries ====================
export interface Country {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
}

export type CountriesResponse = Country[];

// ==================== US States ====================
export interface USState {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
}

export type USStatesResponse = USState[];

// ==================== AKA Types ====================
export interface AKAType {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
}

export type AKATypesResponse = AKAType[];

// ==================== Document Types ====================
export interface DocumentMetadata {
  code: string;
  name: string;
  description: string;
  multiple: boolean;
  classType: string;
  filter: string;
  subType: string;
  valueRestriction: string;
  additionalInfoTags: string[];
}

export interface DocumentType {
  id: number;
  code: string;
  name: string;
  efmRequiresSubCase: boolean;
  isActive: boolean;
  metadata: DocumentMetadata[];
  caseTypes: any[];
  caseCategories: any[];
  formGroups: string[];
}

export type LeadDocumentTypesResponse = DocumentType[];
export type DocumentTypesResponse = DocumentType[];
export type SubsequentDocumentTypesResponse = DocumentType[];

// ==================== Document Upload ====================
export interface UploadedDocument {
  id: string;
  isLeadDocument: boolean;
  documentType: string;
  documentTypeId: number | null;
  documentCode: string;
  file: File | null;
  fileName: string;
  fileSize?: number;
  fileType?: string;
}

export interface DocumentUploadData {
  documents: UploadedDocument[];
  totalDocuments: number;
  hasLeadDocument: boolean;
}

// ==================== API Response Wrappers ====================
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// ============== GetCase API Types ==============

export interface GetCaseRequest {
  courtOrganizationId: string;
  caseTrackingId: string;
  includeParticipants: boolean;
  includeDocketEntry: boolean;
  includeCalendarEvent: boolean;
}

export interface CaseDetails {
  caseTrackingId: string;
  caseDocketId: string;
  caseTitle: string;
  caseCategory: string;
  caseType: string;
  caseStatus: string;
  statusDescription: string;
  filedDate: string;
  courtName: string;
}

export interface AttorneyContactInfo {
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  phone: string;
}

export interface Attorney {
  assignmentId: string;
  id: string;
  name: string;
  organization: string | null;
  barNumber: string;
  role: string;
  contactInfo: AttorneyContactInfo;
}

export interface Party {
  participantRefId: string;
  id: string;
  name: string;
  type: string; // "Person" or "Organization"
  role: string; // "PLAIN", "DEF", etc.
  roleDescription: string; // "Plaintiff", "Defendant"
}

export interface DocketEntry {
  documentId: string;
  description: string;
  entryDate: string;
}

export interface OtherEntity {
  id: string;
  name: string;
  identificationType: string;
  identificationId: string;
  type: string;
}

export interface IncidentAddress {
  street: string;
  city: string | null;
  state: string | null;
  postalCode: string;
  country: string | null;
}

export interface RelatedCaseAssignment {
  associationType: string; // "REPRESENTEDBY"
  participantId: string;
  attorneyAssignmentId: string;
  description: string;
}

export interface GetCaseData {
  caseDetails: CaseDetails;
  attorneys: Attorney[];
  parties: Party[];
  docketEntries: DocketEntry[];
  otherEntities: OtherEntity[];
  incidentAddress: IncidentAddress;
  relatedCaseAssignments: RelatedCaseAssignment[];
}

export interface GetCaseResponse {
  success: boolean;
  message: string;
  caseTrackingId: string;
  data: GetCaseData;
  queriedAt: string;
}

// ============== Codelist API Types ==============

export interface CodelistRelationship {
  relatedListName: string;
  relatedCode: string;
}

export interface CodelistItem {
  code: string;
  name: string;
  description: string;
  relationships?: CodelistRelationship[];
  hasRelationships?: boolean;
}

export interface CodelistResponse {
  code: string;
  name: string;
  description: string;
  relationships?: CodelistRelationship[];
  hasRelationships?: boolean;
}

// ============== Helper function to map API data to app format ==============

export const mapGetCaseDataToAppFormat = (apiData: GetCaseData) => {
  // Extract filed by parties (Plaintiffs) and filed as to parties (Defendants)
  const filedByParties = apiData.parties
    .filter(p => p.role === 'PLAIN' || p.role === 'PETITION' || p.role === 'CROSS_COMP')
    .map(party => {
      // Find attorneys for this party
      const partyAttorneys = apiData.relatedCaseAssignments
        .filter(assignment => assignment.participantId === party.id)
        .map(assignment => {
          const attorney = apiData.attorneys.find(
            a => a.assignmentId === assignment.attorneyAssignmentId
          );
          return attorney;
        })
        .filter(Boolean);

      // Parse name if it's a person
      const nameParts = party.name.split(' ');
      const isOrganization = party.type === 'Organization';

      return {
        id: party.id,
        role: party.role,
        partySubtype: {
          guardianAdLitem: false,
          incompetentPerson: false,
          minor: false,
        },
        type: isOrganization ? 'O' : 'P',
        firstName: !isOrganization && nameParts.length > 0 ? nameParts[0] : '',
        middleName: !isOrganization && nameParts.length > 2 ? nameParts[1] : '',
        lastName: !isOrganization && nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
        suffix: '',
        name: isOrganization ? party.name : '',
        needInterpreter: false,
        nativeLanguage: '',
        filingFeesExemption: false,
        feeExemptionType: '',
        representingYourself: partyAttorneys.length === 0,
        hasAttorney: partyAttorneys.length > 0,
        selfRepAddress: '',
        selfRepAddress2: '',
        selfRepCity: '',
        selfRepState: '',
        selfRepZip: '',
        selfRepCountry: 'US',
        selfRepEmail: '',
        attorneys: partyAttorneys.map(att => ({
          id: att!.id,
          type: 'Attorney',
          role: 'Attorney',
          firstName: att!.name.split(' ')[0] || '',
          middle: att!.name.split(' ').length > 2 ? att!.name.split(' ')[1] : '',
          lastName: att!.name.split(' ').slice(-1)[0] || '',
          suffix: '',
          barNumber: att!.barNumber,
          firm: att!.organization || '',
          email: '', // Not provided in API
          altEmail: '',
          consentToEService: false,
          barNumberSearch: att!.barNumber,
        })),
      };
    });

  const filedAsToParties = apiData.parties
    .filter(p => p.role === 'DEF' || p.role === 'RESP' || p.role === 'CROSS_DEF')
    .map(party => {
      const nameParts = party.name.split(' ');
      const isOrganization = party.type === 'Organization';

      return {
        id: party.id,
        role: party.role,
        partySubtype: {
          guardianAdLitem: false,
          incompetentPerson: false,
          minor: false,
        },
        type: isOrganization ? 'O' : 'P',
        firstName: !isOrganization && nameParts.length > 0 ? nameParts[0] : '',
        middleName: !isOrganization && nameParts.length > 2 ? nameParts[1] : '',
        lastName: !isOrganization && nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
        suffix: '',
        name: isOrganization ? party.name : '',
      };
    });

  return {
    caseData: {
      eFilingTitle: apiData.caseDetails.caseTitle,
      caseType: apiData.caseDetails.caseType,
      caseCategory: apiData.caseDetails.caseCategory,
      caseDocketId: apiData.caseDetails.caseDocketId,
      caseTrackingId: apiData.caseDetails.caseTrackingId,
      caseStatus: apiData.caseDetails.caseStatus,
      filedDate: apiData.caseDetails.filedDate,
    },
    filedByParties,
    filedAsToParties,
  };
};
