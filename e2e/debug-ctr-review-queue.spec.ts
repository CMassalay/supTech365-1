import { test, expect } from '@playwright/test';

test.describe('Debug CTR Review Queue', () => {
  test('should display 10 CTRs for compliance_officer_uat', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Login as compliance_officer_uat
    await page.fill('input[name="username"], input[type="text"]', 'compliance_officer_uat');
    await page.fill('input[name="password"], input[type="password"]', 'Liberia@1847');
    await page.click('button[type="submit"]');
    
    // Wait for navigation after login
    await page.waitForURL(/dashboard|compliance/, { timeout: 10000 });
    console.log('✓ Logged in successfully');
    
    // Navigate to CTR Review page
    await page.goto('/compliance/ctr-review');
    await page.waitForLoadState('networkidle');
    console.log('✓ Navigated to CTR Review page');
    
    // Wait a bit for data to load
    await page.waitForTimeout(2000);
    
    // Check for loading state
    const loadingText = await page.locator('text=/loading/i').count();
    console.log(`Loading indicators found: ${loadingText}`);
    
    // Check for error messages
    const errorText = await page.locator('text=/error|failed/i').count();
    if (errorText > 0) {
      const errorContent = await page.locator('text=/error|failed/i').first().textContent();
      console.log(`✗ Error found: ${errorContent}`);
    }
    
    // Check the page title/header
    const header = await page.locator('h1').first().textContent();
    console.log(`Page header: ${header}`);
    
    // Look for table rows (excluding header)
    const tableRows = await page.locator('table tbody tr').count();
    console.log(`Table rows found: ${tableRows}`);
    
    // Look for "Not Found" or "No data" messages
    const notFoundText = await page.locator('text=/not found|no data|0 pending|0 total/i').count();
    if (notFoundText > 0) {
      const messages = await page.locator('text=/not found|no data|0 pending|0 total/i').allTextContents();
      console.log(`✗ Empty state messages: ${messages.join(', ')}`);
    }
    
    // Check if there are any reference numbers visible
    const refNumbers = await page.locator('text=/F5-UAT-CTR-/i').count();
    console.log(`Reference numbers found: ${refNumbers}`);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'C:/Projects/suptech365/debug-ctr-review.png', fullPage: true });
    console.log('✓ Screenshot saved to debug-ctr-review.png');
    
    // Assertions
    expect(tableRows).toBeGreaterThan(0);
    expect(refNumbers).toBeGreaterThanOrEqual(10);
  });
  
  test('should verify API returns data', async ({ request }) => {
    // Login first
    const loginResponse = await request.post('http://127.0.0.1:8000/api/v1/auth/login', {
      data: {
        username_or_email: 'compliance_officer_uat',
        password: 'Liberia@1847'
      }
    });
    
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log(`✓ Token received: ${token.substring(0, 30)}...`);
    
    // Call review queue API
    const queueResponse = await request.get('http://127.0.0.1:8000/api/v1/review/queue?page=1&page_size=100', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    expect(queueResponse.ok()).toBeTruthy();
    const queueData = await queueResponse.json();
    
    console.log(`✓ API Response:`);
    console.log(`  Total: ${queueData.total}`);
    console.log(`  Items returned: ${queueData.items?.length || 0}`);
    
    if (queueData.items && queueData.items.length > 0) {
      console.log(`  First item: ${JSON.stringify(queueData.items[0], null, 2)}`);
    } else {
      console.log(`  ✗ No items in response`);
    }
    
    // Assertions
    expect(queueData.total).toBeGreaterThan(0);
    expect(queueData.items).toBeDefined();
    expect(queueData.items.length).toBeGreaterThan(0);
  });
});
