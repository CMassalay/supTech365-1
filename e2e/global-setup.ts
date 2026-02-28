import type { FullConfig } from '@playwright/test';
import { setupTestDatabase } from './utils/db-setup';

async function globalSetup(config: FullConfig) {
  console.log('Global setup: Setting up test environment...');
  try {
    await setupTestDatabase();
    console.log('Global setup: Test environment ready.');
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;