import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class TaskAssignmentPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Navigate to Task Assignment
  async navigateToTaskAssignment() {
    await this.navigate('/compliance/task-assignment');
    await this.waitForLoad();
  }

  // Navigate to Team Workload
  async navigateToTeamWorkload() {
    await this.navigate('/compliance/team-workload');
    await this.waitForLoad();
  }

  // Navigate to My Assignments
  async navigateToMyAssignments() {
    await this.navigate('/my-assignments');
    await this.waitForLoad();
  }

  // Verify CTRs displayed in assignment queue
  async verifyCTRsInQueue(expectedCount?: number) {
    const ctrRows = this.page.locator('[data-testid="ctr-assignment-row"]');
    if (expectedCount !== undefined) {
      await expect(ctrRows).toHaveCount(expectedCount);
    } else {
      await expect(ctrRows.first()).toBeVisible();
    }
  }

  // Select CTR for assignment
  async selectCTRForAssignment(referenceNumber: string) {
    const ctrRow = this.page.locator(`[data-testid="ctr-assignment-row"][data-reference="${referenceNumber}"]`);
    await ctrRow.locator('[data-testid="checkbox"]').check();
  }

  // Click Assign Selected button
  async clickAssignSelected() {
    await this.page.locator('[data-testid="assign-selected-btn"]').click();
    await expect(this.page.locator('[data-testid="assignment-modal"]')).toBeVisible();
  }

  // Select assignee from dropdown
  async selectAssignee(assigneeName: string) {
    await this.page.locator('[data-testid="assignee-select"]').click();
    await this.page.locator('[data-testid="assignee-option"]').filter({ hasText: assigneeName }).click();
  }

  // Set deadline
  async setDeadline(dateString: string) {
    await this.page.fill('[data-testid="deadline-input"]', dateString);
  }

  // Submit assignment
  async submitAssignment() {
    await this.page.locator('[data-testid="assign-report-btn"]').click();
  }

  // Verify assignment success
  async verifyAssignmentSuccess() {
    await this.waitForToast('Report assigned successfully');
    // Verify modal closes and queue refreshes
    await expect(this.page.locator('[data-testid="assignment-modal"]')).not.toBeVisible();
  }

  // Verify assignment status update
  async verifyAssignmentStatus(referenceNumber: string, expectedAssignee: string) {
    const ctrRow = this.page.locator(`[data-testid="ctr-assignment-row"][data-reference="${referenceNumber}"]`);
    await expect(ctrRow.locator('[data-testid="assignee-cell"]')).toContainText(expectedAssignee);
  }

  // Verify team workload display
  async verifyTeamWorkloadDisplayed() {
    await expect(this.page.locator('[data-testid="workload-table"]')).toBeVisible();
    const officerRows = this.page.locator('[data-testid="officer-row"]');
    await expect(officerRows).toHaveCountGreaterThan(0);
  }

  // Verify workload summary
  async verifyWorkloadSummary(totalOfficers: number, totalAssignments: number) {
    const summary = this.page.locator('[data-testid="workload-summary"]');
    await expect(summary).toContainText(`Total Team Members: ${totalOfficers}`);
    await expect(summary).toContainText(`Total CTRs: ${totalAssignments}`);
  }

  // Click on officer row to view assignments
  async viewOfficerAssignments(officerName: string) {
    const officerRow = this.page.locator('[data-testid="officer-row"]').filter({ hasText: officerName });
    await officerRow.click();
  }

  // Verify My Assignments display
  async verifyMyAssignmentsDisplayed() {
    await expect(this.page.locator('[data-testid="my-assignments-table"]')).toBeVisible();
  }

  // Verify workload card
  async verifyMyWorkloadCard(activeCount: number) {
    const workloadCard = this.page.locator('[data-testid="my-workload-card"]');
    await expect(workloadCard).toContainText(`${activeCount}`);
    await expect(workloadCard).toContainText('Active Assignments');
  }

  // Click on assignment to view details
  async viewAssignmentDetails(referenceNumber: string) {
    const assignmentRow = this.page.locator(`[data-testid="assignment-row"][data-reference="${referenceNumber}"]`);
    await assignmentRow.click();
  }

  // Apply assignment filters
  async applyAssignmentFilters(filters: { status?: string; risk?: string; age?: string; assigned?: string }) {
    if (filters.status) {
      await this.page.selectOption('[data-testid="assignment-status-filter"]', filters.status);
    }
    if (filters.risk) {
      await this.page.selectOption('[data-testid="assignment-risk-filter"]', filters.risk);
    }
    if (filters.age) {
      await this.page.selectOption('[data-testid="assignment-age-filter"]', filters.age);
    }
    if (filters.assigned) {
      await this.page.selectOption('[data-testid="assignment-assigned-filter"]', filters.assigned);
    }
    await this.page.locator('[data-testid="apply-assignment-filters-btn"]').click();
  }

  // Apply My Assignments filters
  async applyMyAssignmentFilters(filters: { status?: string; dateRange?: { from: string; to: string } }) {
    if (filters.status) {
      await this.page.selectOption('[data-testid="my-status-filter"]', filters.status);
    }
    if (filters.dateRange) {
      await this.page.fill('[data-testid="my-date-from"]', filters.dateRange.from);
      await this.page.fill('[data-testid="my-date-to"]', filters.dateRange.to);
    }
    await this.page.locator('[data-testid="apply-my-filters-btn"]').click();
  }
}