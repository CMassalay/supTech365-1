import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ManualValidationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Navigate to My Assigned Validations
  async navigateToMyAssignedValidations() {
    await this.navigate('/compliance/my-assigned-validations');
    await this.waitForLoad();
  }

  // Navigate to All CTRs (Supervisor view)
  async navigateToAllCTRs() {
    await this.navigate('/compliance/manual-validation');
    await this.waitForLoad();
  }

  // Navigate to CTR Review
  async navigateToCTRReview() {
    await this.navigate('/compliance/ctr-review');
    await this.waitForLoad();
  }

  // Navigate to Audit Logs
  async navigateToAuditLogs() {
    await this.navigate('/compliance/validation-audit-logs');
    await this.waitForLoad();
  }

  // Check if CTRs are displayed in the queue
  async verifyCTRsDisplayed(expectedCount?: number) {
    const ctrRows = this.page.locator('[data-testid="ctr-row"]');
    if (expectedCount !== undefined) {
      await expect(ctrRows).toHaveCount(expectedCount);
    } else {
      await expect(ctrRows.first()).toBeVisible();
    }
  }

  // Verify specific CTR is visible in the queue
  async verifyCTRVisible(referenceNumber: string) {
    const ctrRow = this.page.locator(`[data-testid="ctr-row"][data-reference="${referenceNumber}"]`);
    await expect(ctrRow).toBeVisible();
  }

  // Verify specific CTR is NOT visible in the queue
  async verifyCTRNotVisible(referenceNumber: string) {
    const ctrRow = this.page.locator(`[data-testid="ctr-row"][data-reference="${referenceNumber}"]`);
    await expect(ctrRow).not.toBeVisible();
  }

  // Select a CTR for review
  async selectCTRForReview(referenceNumber: string) {
    const ctrRow = this.page.locator(`[data-testid="ctr-row"][data-reference="${referenceNumber}"]`);
    await ctrRow.locator('[data-testid="view-details-btn"]').click();
    await this.waitForLoad();
  }

  // Verify CTR review page content
  async verifyCTRReviewContent(referenceNumber: string) {
    await expect(this.page.locator('h1')).toContainText('Report Review');
    await expect(this.page.locator('[data-testid="reference-number"]')).toContainText(referenceNumber);
  }

  // Click Return for Correction button
  async clickReturnForCorrection() {
    await this.page.locator('[data-testid="return-correction-btn"]').click();
    await expect(this.page.locator('[data-testid="return-modal"]')).toBeVisible();
  }

  // Click Reject button
  async clickReject() {
    await this.page.locator('[data-testid="reject-btn"]').click();
    await expect(this.page.locator('[data-testid="reject-modal"]')).toBeVisible();
  }

  // Fill reason textarea
  async fillReason(reason: string) {
    await this.page.locator('[data-testid="reason-textarea"]').fill(reason);
  }

  // Submit decision
  async submitDecision(decisionType: 'return' | 'reject' | 'accept') {
    const submitBtn = decisionType === 'return'
      ? '[data-testid="confirm-return-btn"]'
      : decisionType === 'reject'
      ? '[data-testid="confirm-reject-btn"]'
      : '[data-testid="confirm-accept-btn"]';
    await this.page.locator(submitBtn).click();
  }

  // Click Accept button
  async clickAccept() {
    await this.page.locator('[data-testid="accept-btn"]').click();
    await expect(this.page.locator('[data-testid="accept-modal"]')).toBeVisible();
  }

  // Verify validation error for reason
  async verifyReasonValidationError() {
    await expect(this.page.locator('[data-testid="reason-error"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="reason-error"]')).toContainText('mandatory');
  }

  // Verify success and navigation back to queue
  async verifyDecisionSuccess() {
    await this.waitForToast('Decision submitted successfully');
    await expect(this.page).toHaveURL(/\/compliance\/my-assigned-validations/);
  }

  // Apply filters
  async applyFilters(filters: { status?: string; risk?: string; age?: string }) {
    if (filters.status) {
      await this.page.selectOption('[data-testid="status-filter"]', filters.status);
    }
    if (filters.risk) {
      await this.page.selectOption('[data-testid="risk-filter"]', filters.risk);
    }
    if (filters.age) {
      await this.page.selectOption('[data-testid="age-filter"]', filters.age);
    }
    await this.page.locator('[data-testid="apply-filters-btn"]').click();
  }

  // Clear filters
  async clearFilters() {
    await this.page.locator('[data-testid="clear-filters-btn"]').click();
  }

  // Verify audit logs display
  async verifyAuditLogsDisplayed() {
    await expect(this.page.locator('[data-testid="audit-log-table"]')).toBeVisible();
    const logRows = this.page.locator('[data-testid="audit-log-row"]');
    await expect(logRows.first()).toBeVisible();
  }

  // Verify specific audit log entry
  async verifyAuditLogEntry(referenceNumber: string, decision: string) {
    const logRow = this.page.locator(`[data-testid="audit-log-row"][data-reference="${referenceNumber}"]`);
    await expect(logRow).toBeVisible();
    await expect(logRow.locator('[data-testid="decision-cell"]')).toContainText(decision);
  }

  // Apply audit log filters
  async applyAuditLogFilters(filters: { decision?: string; fromDate?: string; toDate?: string; user?: string; reference?: string }) {
    if (filters.decision) {
      await this.page.selectOption('[data-testid="decision-filter"]', filters.decision);
    }
    if (filters.fromDate) {
      await this.page.fill('[data-testid="from-date"]', filters.fromDate);
    }
    if (filters.toDate) {
      await this.page.fill('[data-testid="to-date"]', filters.toDate);
    }
    if (filters.user) {
      await this.page.selectOption('[data-testid="user-filter"]', filters.user);
    }
    if (filters.reference) {
      await this.page.fill('[data-testid="reference-search"]', filters.reference);
    }
    await this.page.locator('[data-testid="apply-audit-filters-btn"]').click();
  }

  // ========== STR-related methods ==========

  // Navigate to My Assigned STRs (Analyst view)
  async navigateToMyAssignedSTRs() {
    await this.navigate('/analysis/my-assigned-validations');
    await this.waitForLoad();
  }

  // Navigate to STR Analysis page
  async navigateToSTRAnalysis() {
    await this.navigate('/analysis/str-analysis');
    await this.waitForLoad();
  }

  // Check if STRs are displayed in the queue
  async verifySTRsDisplayed(expectedCount?: number) {
    const strRows = this.page.locator('[data-testid="str-row"]');
    if (expectedCount !== undefined) {
      await expect(strRows).toHaveCount(expectedCount);
    } else {
      await expect(strRows.first()).toBeVisible();
    }
  }

  // Verify specific STR is visible in the queue
  async verifySTRVisible(referenceNumber: string) {
    const strRow = this.page.locator(`[data-testid="str-row"][data-reference="${referenceNumber}"]`);
    await expect(strRow).toBeVisible();
  }

  // Verify specific STR is NOT visible in the queue
  async verifySTRNotVisible(referenceNumber: string) {
    const strRow = this.page.locator(`[data-testid="str-row"][data-reference="${referenceNumber}"]`);
    await expect(strRow).not.toBeVisible();
  }

  // Select an STR for review
  async selectSTRForReview(referenceNumber: string) {
    const strRow = this.page.locator(`[data-testid="str-row"][data-reference="${referenceNumber}"]`);
    await strRow.locator('[data-testid="view-details-btn"]').click();
    await this.waitForLoad();
  }

  // Verify STR review page content
  async verifySTRReviewContent(referenceNumber: string) {
    await expect(this.page.locator('h1')).toContainText('Report Review');
    await expect(this.page.locator('[data-testid="reference-number"]')).toContainText(referenceNumber);
    await expect(this.page.locator('[data-testid="report-type"]')).toContainText('STR');
  }

  // ========== Review/Disposition methods ==========

  // Click Archive button
  async clickArchive() {
    await this.page.locator('[data-testid="archive-btn"]').click();
    await expect(this.page.locator('[data-testid="archive-modal"]')).toBeVisible();
  }

  // Click Monitor button
  async clickMonitor() {
    await this.page.locator('[data-testid="monitor-btn"]').click();
    await expect(this.page.locator('[data-testid="monitor-modal"]')).toBeVisible();
  }

  // Click Escalate button
  async clickEscalate() {
    await this.page.locator('[data-testid="escalate-btn"]').click();
    await expect(this.page.locator('[data-testid="escalate-modal"]')).toBeVisible();
  }

  // Fill review notes
  async fillReviewNotes(notes: string) {
    await this.page.locator('[data-testid="review-notes-textarea"]').fill(notes);
  }

  // Submit disposition decision
  async submitDisposition(dispositionType: 'archive' | 'monitor' | 'escalate') {
    const submitBtn = dispositionType === 'archive'
      ? '[data-testid="confirm-archive-btn"]'
      : dispositionType === 'monitor'
      ? '[data-testid="confirm-monitor-btn"]'
      : '[data-testid="confirm-escalate-btn"]';
    await this.page.locator(submitBtn).click();
  }

  // Verify disposition success
  async verifyDispositionSuccess() {
    await this.waitForToast('Disposition decision submitted successfully');
  }

  // ========== Queue ordering methods ==========

  // Get all report reference numbers in queue order
  async getReportOrderInQueue(reportType: 'ctr' | 'str' = 'ctr') {
    const rowSelector = reportType === 'ctr' ? '[data-testid="ctr-row"]' : '[data-testid="str-row"]';
    const rows = this.page.locator(rowSelector);
    const count = await rows.count();
    const references: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const ref = await rows.nth(i).getAttribute('data-reference');
      if (ref) references.push(ref);
    }
    
    return references;
  }

  // Get submission timestamps for reports in queue
  async getReportSubmissionTimestamps() {
    const timestampCells = this.page.locator('[data-testid="submission-timestamp"]');
    const count = await timestampCells.count();
    const timestamps: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const timestamp = await timestampCells.nth(i).textContent();
      if (timestamp) timestamps.push(timestamp.trim());
    }
    
    return timestamps;
  }

  // Verify reports are ordered oldest first
  async verifyReportsOrderedOldestFirst() {
    const timestamps = await this.getReportSubmissionTimestamps();
    
    // Convert to dates and verify they're in ascending order (oldest first)
    for (let i = 0; i < timestamps.length - 1; i++) {
      const current = new Date(timestamps[i]);
      const next = new Date(timestamps[i + 1]);
      expect(current.getTime()).toBeLessThanOrEqual(next.getTime());
    }
  }

  // ========== Access control methods ==========

  // Verify access denied message
  async verifyAccessDenied() {
    await expect(this.page.locator('[data-testid="access-denied"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="access-denied"]')).toContainText(
      'You do not have permission'
    );
  }

  // Verify report not assigned error
  async verifyReportNotAssignedError() {
    await expect(this.page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="error-message"]')).toContainText(
      'This report is assigned to another staff member'
    );
  }

  // Try to access report directly by URL
  async attemptDirectAccessToReport(reportId: string) {
    await this.navigate(`/compliance/report/${reportId}`);
    await this.waitForLoad();
  }

  // ========== Dual queue behavior methods ==========

  // Verify report exists in both queues
  async verifyReportInBothQueues(referenceNumber: string) {
    // Check Manual Validation queue
    await this.navigateToMyAssignedValidations();
    await this.verifyCTRVisible(referenceNumber);
    
    // Check Review queue
    await this.navigateToCTRReview();
    await this.verifyCTRVisible(referenceNumber);
  }

  // Verify report removed from review queue after return/reject
  async verifyReportRemovedFromReviewQueue(referenceNumber: string) {
    await this.navigateToCTRReview();
    await this.verifyCTRNotVisible(referenceNumber);
  }

  // ========== Audit log verification methods ==========

  // Verify audit log contains all required fields
  async verifyAuditLogFields(referenceNumber: string) {
    const logRow = this.page.locator(`[data-testid="audit-log-row"][data-reference="${referenceNumber}"]`);
    await expect(logRow).toBeVisible();
    
    // Verify required fields
    await expect(logRow.locator('[data-testid="reviewer-name"]')).toBeVisible();
    await expect(logRow.locator('[data-testid="decision-cell"]')).toBeVisible();
    await expect(logRow.locator('[data-testid="timestamp-cell"]')).toBeVisible();
    await expect(logRow.locator('[data-testid="reference-cell"]')).toContainText(referenceNumber);
  }

  // Verify audit log has reason for Return/Reject decisions
  async verifyAuditLogReason(referenceNumber: string, expectedReason: string) {
    const logRow = this.page.locator(`[data-testid="audit-log-row"][data-reference="${referenceNumber}"]`);
    await expect(logRow.locator('[data-testid="reason-cell"]')).toContainText(expectedReason);
  }

  // ========== Report content verification ==========

  // Verify report content sections are displayed
  async verifyReportContentSections() {
    await expect(this.page.locator('[data-testid="report-header"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="entity-information"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="transaction-details"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="narrative-section"]')).toBeVisible();
  }

  // Verify transaction rows are displayed
  async verifyTransactionRowsDisplayed(expectedCount?: number) {
    const transactionRows = this.page.locator('[data-testid="transaction-row"]');
    if (expectedCount !== undefined) {
      await expect(transactionRows).toHaveCount(expectedCount);
    } else {
      await expect(transactionRows.first()).toBeVisible();
    }
  }
}