import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(url: string) {
    await this.page.goto(url);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getToastMessage(): Promise<string | null> {
    const toast = this.page.locator('[data-testid="toast"]').first();
    return toast.isVisible() ? toast.textContent() : null;
  }

  async waitForToast(message?: string): Promise<void> {
    const toast = this.page.locator('[data-testid="toast"]').first();
    await toast.waitFor({ state: 'visible' });
    if (message) {
      await toast.filter({ hasText: message }).waitFor();
    }
  }
}