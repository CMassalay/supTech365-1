import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AuthPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async login(username: string, password: string) {
    // Navigate to login if not already there
    if (!this.page.url().includes('/login')) {
      await this.navigate('/login');
    }

    // Fill in login form
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);

    // Submit form
    await this.page.click('button[type="submit"]');

    // Wait for navigation away from login page
    await this.page.waitForURL((url) => !url.pathname.includes('/login'));
  }

  async logout() {
    // Click user menu dropdown
    await this.page.click('[data-testid="user-menu"]');

    // Click logout option
    await this.page.click('[data-testid="logout-button"]');

    // Verify redirected to login
    await expect(this.page).toHaveURL('/login');
  }

  async verifyLoggedInAs(username: string) {
    const userMenu = this.page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toContainText(username);
  }
}