import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class NotificationsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Click notification bell to open dropdown
  async openNotificationDropdown() {
    await this.page.locator('[data-testid="notification-bell"]').click();
    await expect(this.page.locator('[data-testid="notification-dropdown"]')).toBeVisible();
  }

  // Get unread notification count from badge
  async getUnreadCount(): Promise<number> {
    const badge = this.page.locator('[data-testid="notification-badge"]');
    if (await badge.isVisible()) {
      const countText = await badge.textContent();
      return parseInt(countText || '0');
    }
    return 0;
  }

  // Verify notification badge shows expected count
  async verifyNotificationBadge(expectedCount: number) {
    if (expectedCount > 0) {
      const badge = this.page.locator('[data-testid="notification-badge"]');
      await expect(badge).toBeVisible();
      await expect(badge).toContainText(expectedCount.toString());
    } else {
      await expect(this.page.locator('[data-testid="notification-badge"]')).not.toBeVisible();
    }
  }

  // Click on a notification in dropdown
  async clickNotification(title: string) {
    const notification = this.page.locator('[data-testid="notification-item"]').filter({ hasText: title });
    await notification.click();
  }

  // Click "View All Notifications" in dropdown
  async viewAllNotifications() {
    await this.page.locator('[data-testid="view-all-notifications"]').click();
    await this.waitForLoad();
    await expect(this.page).toHaveURL('/notifications');
  }

  // Navigate to full notifications page
  async navigateToNotificationsPage() {
    await this.navigate('/notifications');
    await this.waitForLoad();
  }

  // Verify notifications page content
  async verifyNotificationsPage() {
    await expect(this.page.locator('h1')).toContainText('Notifications');
  }

  // Mark notification as read
  async markNotificationAsRead(title: string) {
    const notification = this.page.locator('[data-testid="notification-item"]').filter({ hasText: title });
    // Click the mark as read button or the notification itself
    await notification.locator('[data-testid="mark-read-btn"]').click();
  }

  // Mark all notifications as read
  async markAllAsRead() {
    await this.page.locator('[data-testid="mark-all-read-btn"]').click();
    await this.waitForToast('All notifications marked as read');
  }

  // Verify notification is marked as read (appears with different styling)
  async verifyNotificationRead(title: string) {
    const notification = this.page.locator('[data-testid="notification-item"]').filter({ hasText: title });
    await expect(notification).toHaveAttribute('data-read', 'true');
  }

  // Verify notification content
  async verifyNotificationContent(title: string, expectedContent: { message?: string; timeAgo?: string }) {
    const notification = this.page.locator('[data-testid="notification-item"]').filter({ hasText: title });

    if (expectedContent.message) {
      await expect(notification).toContainText(expectedContent.message);
    }

    if (expectedContent.timeAgo) {
      await expect(notification.locator('[data-testid="notification-time"]')).toContainText(expectedContent.timeAgo);
    }
  }

  // Apply notification filters
  async applyNotificationFilters(filters: { readStatus?: 'all' | 'unread' | 'read'; dateRange?: 'today' | 'week' | 'month' }) {
    if (filters.readStatus) {
      await this.page.selectOption('[data-testid="read-status-filter"]', filters.readStatus);
    }
    if (filters.dateRange) {
      await this.page.selectOption('[data-testid="date-range-filter"]', filters.dateRange);
    }
    await this.page.locator('[data-testid="apply-notification-filters-btn"]').click();
  }

  // Verify notification list is empty
  async verifyNoNotifications() {
    await expect(this.page.locator('[data-testid="no-notifications"]')).toBeVisible();
  }

  // Verify notification appears in dropdown
  async verifyNotificationInDropdown(title: string) {
    const dropdown = this.page.locator('[data-testid="notification-dropdown"]');
    await expect(dropdown).toContainText(title);
  }

  // Close notification dropdown
  async closeNotificationDropdown() {
    // Click outside or press escape
    await this.page.keyboard.press('Escape');
    await expect(this.page.locator('[data-testid="notification-dropdown"]')).not.toBeVisible();
  }
}