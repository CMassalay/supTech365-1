import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { ManualValidationPage } from '../pages/manual-validation.page';
import { TEST_USERS, TEST_REPORTS } from '../utils/test-data';

test.describe('Revised CTR Workflow E2E Tests', () => {
  let authPage: AuthPage;
  let manualValidationPage: ManualValidationPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    manualValidationPage = new ManualValidationPage(page);
  });

  test('Test Case 1: Simultaneous Appearance in Both Menus', async ({ page }) => {
    const report = TEST_REPORTS.ctrSimul;
    const user = TEST_USERS.complianceOfficerA;

    // Login as Compliance Officer A
    await authPage.login(user.username, user.password);

    // 1. Check My Assigned Validations
    await manualValidationPage.navigateToMyAssignedValidations();
    await manualValidationPage.verifyCTRVisible(report.referenceNumber);

    // 2. Check CTR Review - My Assigned CTRs
    await manualValidationPage.navigateToCTRReview();
    await manualValidationPage.verifyCTRVisible(report.referenceNumber);
  });

  test('Test Case 2: Exclusion Logic - Rejection', async ({ page }) => {
    const report = TEST_REPORTS.ctrReject;
    const user = TEST_USERS.complianceOfficerA;

    // Login as Compliance Officer A
    await authPage.login(user.username, user.password);

    // Verify visible in both first
    await manualValidationPage.navigateToMyAssignedValidations();
    await manualValidationPage.verifyCTRVisible(report.referenceNumber);
    await manualValidationPage.navigateToCTRReview();
    await manualValidationPage.verifyCTRVisible(report.referenceNumber);

    // Go to Manual Validation and Reject
    await manualValidationPage.navigateToMyAssignedValidations();
    await manualValidationPage.selectCTRForReview(report.referenceNumber);
    await manualValidationPage.clickReject();
    await manualValidationPage.fillReason('This report is rejected for E2E testing purposes due to invalid data patterns.');
    await manualValidationPage.submitDecision('reject');
    await manualValidationPage.verifyDecisionSuccess();

    // Verify disappeared from Manual Validation
    await manualValidationPage.verifyCTRNotVisible(report.referenceNumber);

    // Verify disappeared from CTR Review
    await manualValidationPage.navigateToCTRReview();
    await manualValidationPage.verifyCTRNotVisible(report.referenceNumber);
  });

  test('Test Case 3: Exclusion Logic - Return', async ({ page }) => {
    const report = TEST_REPORTS.ctrReturn;
    const user = TEST_USERS.complianceOfficerA;

    // Login as Compliance Officer A
    await authPage.login(user.username, user.password);

    // Verify visible in both first
    await manualValidationPage.navigateToMyAssignedValidations();
    await manualValidationPage.verifyCTRVisible(report.referenceNumber);
    await manualValidationPage.navigateToCTRReview();
    await manualValidationPage.verifyCTRVisible(report.referenceNumber);

    // Go to Manual Validation and Return
    await manualValidationPage.navigateToMyAssignedValidations();
    await manualValidationPage.selectCTRForReview(report.referenceNumber);
    await manualValidationPage.clickReturnForCorrection();
    await manualValidationPage.fillReason('This report is returned for E2E testing purposes to verify exclusion logic.');
    await manualValidationPage.submitDecision('return');
    await manualValidationPage.verifyDecisionSuccess();

    // Verify disappeared from Manual Validation
    await manualValidationPage.verifyCTRNotVisible(report.referenceNumber);

    // Verify disappeared from CTR Review
    await manualValidationPage.navigateToCTRReview();
    await manualValidationPage.verifyCTRNotVisible(report.referenceNumber);
  });

  test('Test Case 4: Supervisor Assignment and CO Visibility', async ({ page }) => {
    const report = TEST_REPORTS.ctrUnassigned;
    const supervisor = TEST_USERS.complianceSupervisor;
    const officerB = TEST_USERS.complianceOfficerB;

    // 1. Login as Supervisor
    await authPage.login(supervisor.username, supervisor.password);

    // 2. Navigate to Task Assignment
    const taskAssignmentPage = new (require('../pages/task-assignment.page').TaskAssignmentPage)(page);
    await taskAssignmentPage.navigateToTaskAssignment();

    // 3. Assign to Officer B
    await taskAssignmentPage.selectCTRForAssignment(report.referenceNumber);
    await taskAssignmentPage.clickAssignSelected();
    await taskAssignmentPage.selectAssignee(officerB.username);
    await taskAssignmentPage.submitAssignment();
    await taskAssignmentPage.verifyAssignmentSuccess();

    // 4. Logout Supervisor
    await authPage.logout();

    // 5. Login as Officer B
    await authPage.login(officerB.username, officerB.password);

    // 6. Verify visible in both menus for Officer B
    await manualValidationPage.navigateToMyAssignedValidations();
    await manualValidationPage.verifyCTRVisible(report.referenceNumber);
    await manualValidationPage.navigateToCTRReview();
    await manualValidationPage.verifyCTRVisible(report.referenceNumber);

    // 7. Verify NOT visible for Officer A
    await authPage.logout();
    await authPage.login(TEST_USERS.complianceOfficerA.username, TEST_USERS.complianceOfficerA.password);
    await manualValidationPage.navigateToMyAssignedValidations();
    await manualValidationPage.verifyCTRNotVisible(report.referenceNumber);
    await manualValidationPage.navigateToCTRReview();
    await manualValidationPage.verifyCTRNotVisible(report.referenceNumber);
  });

  test('Test Case 5: STR Sequential Progression', async ({ page }) => {
    const report = TEST_REPORTS.strSeq;
    const user = TEST_USERS.analyst;

    // 1. Login as Analyst
    await authPage.login(user.username, user.password);

    // 2. Navigate to My Assigned Validations
    await manualValidationPage.navigateToMyAssignedValidations();
    await manualValidationPage.verifyCTRVisible(report.referenceNumber);

    // 3. Accept STR
    await manualValidationPage.selectCTRForReview(report.referenceNumber);
    await manualValidationPage.clickAccept();
    await manualValidationPage.submitDecision('accept');
    await manualValidationPage.verifyDecisionSuccess();

    // 4. Verify routed to Analysis (by checking if it's gone from validation queue)
    await manualValidationPage.verifyCTRNotVisible(report.referenceNumber);
    
    // Note: In a full E2E, we would navigate to the Analysis stage UI to confirm it appears there.
  });

  test('Test Case 6: Audit Log Integrity', async ({ page }) => {
    const supervisor = TEST_USERS.headOfCompliance;
    const report = TEST_REPORTS.ctrReject;

    // 1. Login as Head of Compliance
    await authPage.login(supervisor.username, supervisor.password);

    // 2. Navigate to Audit Logs
    await manualValidationPage.navigateToAuditLogs();

    // 3. Filter by reference (from Test Case 2)
    await manualValidationPage.applyAuditLogFilters({ reference: report.referenceNumber });

    // 4. Verify REJECT entry exists
    await manualValidationPage.verifyAuditLogEntry(report.referenceNumber, 'REJECT');
  });
});
