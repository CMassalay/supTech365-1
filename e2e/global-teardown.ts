import type { FullConfig } from '@playwright/test';
import { cleanupTestDatabase } from './utils/db-cleanup';

async function globalTeardown(config: FullConfig) {
  console.log('Global teardown: Cleaning up test environment...');
  try {
    await cleanupTestDatabase();
    console.log('Global teardown: Test environment cleaned.');
  } catch (error) {
    console.error('Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown;