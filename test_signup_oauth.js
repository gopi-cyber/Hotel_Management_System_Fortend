const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const screenshotDir = path.join(__dirname, 'screenshots', 'signup_oauth');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  console.log('1. Navigating to /register...');
  await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle' });

  // Verify removed text
  const bodyText = await page.textContent('body');
  if (bodyText.includes('Create Guest Account') || bodyText.includes('Staff & Administrative accounts are provisioned exclusively')) {
    console.error('FAIL: Unwanted explanatory text still present!');
    process.exit(1);
  } else {
    console.log('SUCCESS: Explanatory text removed.');
  }

  await page.screenshot({ path: path.join(screenshotDir, '01_clean_signup_page.png') });

  // Check Google OAuth button and click
  console.log('2. Opening Google Sign In modal...');
  const googleBtn = page.locator('text=Continue with Google');
  await googleBtn.click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(screenshotDir, '02_google_oauth_modal.png') });

  // Click on active Google account
  console.log('3. Selecting Google account (Gopinath)...');
  const accountBtn = page.locator('text=Gopinath').first();
  await accountBtn.click();

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(1000);
  console.log('SUCCESS: Logged in and redirected to /dashboard!');

  await page.screenshot({ path: path.join(screenshotDir, '03_dashboard_after_oauth.png') });

  await browser.close();
  console.log('ALL TESTS PASSED!');
})();
