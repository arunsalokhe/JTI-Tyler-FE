// types/caseDetails.types.ts

/**
 * Interface for case details information
 */
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

/**
 * Interface for address information
 */
export interface Address {
  street: string;
  city: string | null;
  state: string | null;
  zip?: string;
  postalCode?: string;
  country?: string | null;
}

/**
 * Interface for contact information
 */
export interface ContactInfo {
  address: Address;
  phone: string;
  email?: string;
}

/**
 * Interface for attorney information
 */
export interface Attorney {
  assignmentId: string;
  id: string;
  name: string;
  organization: string | null;
  barNumber: string;
  role: string;
  contactInfo: ContactInfo;
}

/**
 * Interface for party/participant information
 */
export interface Party {
  participantRefId: string;
  id: string;
  name: string;
  type: 'Person' | 'Organization';
  role: string;
  roleDescription: string;
}

/**
 * Interface for docket entry
 */
export interface DocketEntry {
  documentId: string;
  description: string;
  entryDate: string;
}

/**
 * Interface for other entities
 */
export interface OtherEntity {
  id: string;
  name: string;
  identificationType: string;
  identificationId: string;
  type: 'Person' | 'Organization';
}

/**
 * Interface for related case assignments
 */
export interface RelatedCaseAssignment {
  associationType: string;
  participantId: string;
  attorneyAssignmentId: string;
  description: string;
}

/**
 * Interface for the main case data
 */
export interface CaseData {
  caseDetails: CaseDetails;
  attorneys: Attorney[];
  parties: Party[];
  docketEntries: DocketEntry[];
  otherEntities: OtherEntity[];
  incidentAddress: Address;
  relatedCaseAssignments: RelatedCaseAssignment[];
}

/**
 * Interface for GetCase API response
 */
export interface GetCaseResponse {
  success: boolean;
  message: string;
  caseTrackingId: string;
  data: CaseData;
  queriedAt: string;
  error?: string; // Optional error field for detailed error messages
}

/**
 * Interface for GetCase API request parameters
 */
export interface GetCaseRequest {
  courtOrganizationId: string;
  caseTrackingId: string;
  includeParticipants: boolean;
  includeDocketEntry: boolean;
  includeCalendarEvent: boolean;
}