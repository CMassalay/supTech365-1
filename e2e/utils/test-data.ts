// Test data management for E2E tests

export interface TestUser {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface TestReport {
  id: string;
  referenceNumber: string;
  reportType: 'CTR' | 'STR';
  entityName: string;
  status: string;
}

// Test user accounts for different roles
export const TEST_USERS: Record<string, TestUser> = {
  complianceOfficer: {
    id: 'co-001',
    username: 'officer_a',
    email: 'officer_a@fia.lr',
    password: 'TestPassword123!',
    role: 'COMPLIANCE_OFFICER'
  },
  complianceOfficerA: {
    id: 'co-a',
    username: 'officer_a',
    email: 'officer_a@fia.lr',
    password: 'TestPassword123!',
    role: 'COMPLIANCE_OFFICER'
  },
  complianceOfficerB: {
    id: 'co-b',
    username: 'officer_b',
    email: 'officer_b@fia.lr',
    password: 'TestPassword123!',
    role: 'COMPLIANCE_OFFICER'
  },
  complianceSupervisor: {
    id: 'cs-001',
    username: 'supervisor',
    email: 'supervisor@fia.lr',
    password: 'TestPassword123!',
    role: 'COMPLIANCE_SUPERVISOR'
  },
  headOfCompliance: {
    id: 'hoc-001',
    username: 'ho_compliance',
    email: 'ho_compliance@fia.lr',
    password: 'TestPassword123!',
    role: 'HEAD_OF_COMPLIANCE'
  },
  headOfAnalysis: {
    id: 'hoa-001',
    username: 'head_of_analysis',
    email: 'hoa@suptech365.com',
    password: 'TestPassword123!',
    role: 'HEAD_OF_ANALYSIS'
  },
  analyst: {
    id: 'analyst-001',
    username: 'analyst',
    email: 'analyst@fia.lr',
    password: 'TestPassword123!',
    role: 'ANALYST'
  }
};

// Test report data
export const TEST_REPORTS: Record<string, TestReport> = {
  ctrSimul: {
    id: 'ctr-simul',
    referenceNumber: 'E2E-CTR-SIMUL',
    reportType: 'CTR',
    entityName: 'Test Bank Ltd',
    status: 'under_compliance_review'
  },
  ctrReject: {
    id: 'ctr-reject',
    referenceNumber: 'E2E-CTR-REJECT',
    reportType: 'CTR',
    entityName: 'Test Bank Ltd',
    status: 'under_compliance_review'
  },
  ctrReturn: {
    id: 'ctr-return',
    referenceNumber: 'E2E-CTR-RETURN',
    reportType: 'CTR',
    entityName: 'Test Bank Ltd',
    status: 'under_compliance_review'
  },
  ctrUnassigned: {
    id: 'ctr-unassigned',
    referenceNumber: 'E2E-CTR-UNASSIGNED',
    reportType: 'CTR',
    entityName: 'Test Bank Ltd',
    status: 'under_compliance_review'
  },
  ctrDualQueue: {
    id: 'ctr-dual',
    referenceNumber: 'E2E-CTR-DUAL',
    reportType: 'CTR',
    entityName: 'Test Bank Ltd',
    status: 'validated'
  },
  ctrForReview: {
    id: 'ctr-review',
    referenceNumber: 'E2E-CTR-REVIEW',
    reportType: 'CTR',
    entityName: 'Test Bank Ltd',
    status: 'validated'
  },
  ctrOldest: {
    id: 'ctr-oldest',
    referenceNumber: 'E2E-CTR-OLDEST',
    reportType: 'CTR',
    entityName: 'Test Bank Ltd',
    status: 'validated'
  },
  ctrMiddle: {
    id: 'ctr-middle',
    referenceNumber: 'E2E-CTR-MIDDLE',
    reportType: 'CTR',
    entityName: 'Test Bank Ltd',
    status: 'validated'
  },
  ctrNewest: {
    id: 'ctr-newest',
    referenceNumber: 'E2E-CTR-NEWEST',
    reportType: 'CTR',
    entityName: 'Test Bank Ltd',
    status: 'validated'
  },
  strSeq: {
    id: 'str-seq',
    referenceNumber: 'E2E-STR-SEQ',
    reportType: 'STR',
    entityName: 'Test Bank Ltd',
    status: 'under_analysis'
  },
  strForAnalyst: {
    id: 'str-analyst',
    referenceNumber: 'E2E-STR-ANALYST',
    reportType: 'STR',
    entityName: 'Test Bank Ltd',
    status: 'validated'
  },
  strReturn: {
    id: 'str-return',
    referenceNumber: 'E2E-STR-RETURN',
    reportType: 'STR',
    entityName: 'Test Bank Ltd',
    status: 'validated'
  },
  strReject: {
    id: 'str-reject',
    referenceNumber: 'E2E-STR-REJECT',
    reportType: 'STR',
    entityName: 'Test Bank Ltd',
    status: 'validated'
  },
  strDualQueue: {
    id: 'str-dual',
    referenceNumber: 'E2E-STR-DUAL',
    reportType: 'STR',
    entityName: 'Test Bank Ltd',
    status: 'validated'
  },
  ctr001: {
    id: 'ctr-001',
    referenceNumber: 'FIA-2026-001234',
    reportType: 'CTR',
    entityName: 'Bank of Liberia',
    status: 'validated'
  },
  ctr002: {
    id: 'ctr-002',
    referenceNumber: 'FIA-2026-001235',
    reportType: 'CTR',
    entityName: 'First Bank',
    status: 'validated'
  },
  str001: {
    id: 'str-001',
    referenceNumber: 'FIA-2026-002001',
    reportType: 'STR',
    entityName: 'Unity Corp',
    status: 'validated'
  },
  str002: {
    id: 'str-002',
    referenceNumber: 'FIA-2026-002002',
    reportType: 'STR',
    entityName: 'Global Finance',
    status: 'validated'
  }
};

// Helper functions for test data
export function getTestUser(role: keyof typeof TEST_USERS): TestUser {
  return TEST_USERS[role];
}

export function getTestReport(id: keyof typeof TEST_REPORTS): TestReport {
  return TEST_REPORTS[id];
}