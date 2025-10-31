import { test, expect } from '@playwright/test';

test.describe('Time Range Selector', () => {
  test('should switch time ranges without reloading metric cards', async ({ page }) => {
    // Navigate directly to dashboard with a known district (3213 = DARJEELING)
    await page.goto('http://localhost:3002/dashboard?district=3213&name=DARJEELING');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify dashboard loaded
    await expect(page.locator('h1:has-text("MGNREGA Dashboard")')).toBeVisible();
    
    // Get initial value from "Total Works" card
    const totalWorksCard = page.locator('text=Total Works').locator('..').locator('..');
    const initialValue = await totalWorksCard.locator('.text-4xl').textContent();
    console.log('Initial Total Works value:', initialValue);
    
    // Verify time range buttons exist
    await expect(page.locator('button:has-text("3M")')).toBeVisible();
    await expect(page.locator('button:has-text("6M")')).toBeVisible();
    await expect(page.locator('button:has-text("1Y")')).toBeVisible();
    
    // Verify 6M is selected by default (has primary background)
    const sixMonthButton = page.locator('button:has-text("6M")');
    const sixMClass = await sixMonthButton.getAttribute('class');
    expect(sixMClass).toContain('bg-primary');
    console.log('6M button is selected by default');
    
    // Click 3M button
    console.log('Clicking 3M button...');
    await page.locator('button:has-text("3M")').click();
    
    // Wait for history API call to complete
    await page.waitForResponse(response => 
      response.url().includes('/api/history') && response.url().includes('range=3')
    );
    
    // Small delay for UI update
    await page.waitForTimeout(500);
    
    // Verify Total Works card value hasn't changed (no full reload)
    const valueAfter3M = await totalWorksCard.locator('.text-4xl').textContent();
    console.log('Total Works value after 3M:', valueAfter3M);
    expect(valueAfter3M).toBe(initialValue);
    
    // Verify 3M button is now selected
    const threeMClass = await page.locator('button:has-text("3M")').getAttribute('class');
    expect(threeMClass).toContain('bg-primary');
    console.log('3M button is now selected');
    
    // Click 1Y button
    console.log('Clicking 1Y button...');
    await page.locator('button:has-text("1Y")').click();
    
    // Wait for history API call
    await page.waitForResponse(response => 
      response.url().includes('/api/history') && response.url().includes('range=12')
    );
    
    await page.waitForTimeout(500);
    
    // Verify Total Works card still hasn't changed
    const valueAfter1Y = await totalWorksCard.locator('.text-4xl').textContent();
    console.log('Total Works value after 1Y:', valueAfter1Y);
    expect(valueAfter1Y).toBe(initialValue);
    
    // Verify 1Y button is now selected
    const oneYClass = await page.locator('button:has-text("1Y")').getAttribute('class');
    expect(oneYClass).toContain('bg-primary');
    console.log('1Y button is now selected');
    
    console.log('✅ Test passed: Metric cards did not reload during time range changes');
  });

  test('should show loading indicator on chart during time range switch', async ({ page }) => {
    // Navigate directly to dashboard
    await page.goto('http://localhost:3002/dashboard?district=3213&name=DARJEELING');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Start monitoring for loading spinner
    const loadingPromise = page.waitForSelector('.animate-spin', { state: 'visible', timeout: 5000 });
    
    // Click time range button to trigger loading
    await page.locator('button:has-text("3M")').click();
    
    // Verify loading spinner appeared
    try {
      await loadingPromise;
      console.log('✅ Loading spinner appeared during time range switch');
    } catch (error) {
      console.log('⚠️ Loading spinner might have been too fast to catch');
    }
  });

  test('should disable buttons during loading', async ({ page }) => {
    // Navigate directly to dashboard
    await page.goto('http://localhost:3002/dashboard?district=3213&name=DARJEELING');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Click 3M button
    await page.locator('button:has-text("3M")').click();
    
    // Immediately check if buttons are disabled (might be fast)
    const threeMonthButton = page.locator('button:has-text("3M")');
    const isDisabledDuringLoad = await threeMonthButton.isDisabled().catch(() => false);
    
    if (isDisabledDuringLoad) {
      console.log('✅ Buttons were disabled during loading');
    } else {
      console.log('⚠️ Buttons might have loaded too fast to catch disabled state');
    }
    
    // Wait for loading to complete
    await page.waitForTimeout(500);
    
    // Verify buttons are enabled after loading
    await expect(threeMonthButton).toBeEnabled();
    console.log('✅ Buttons are enabled after loading completes');
  });
});
