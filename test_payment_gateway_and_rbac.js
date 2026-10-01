const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.resolve(__dirname, 'screenshots/payment_rbac');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  console.log('=== TEST 1: REGISTRATION PAGE GUEST SECURITY ===');
  const context1 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page1 = await context1.newPage();
  await page1.goto('http://localhost:3000/register', { waitUntil: 'networkidle' });
  await page1.screenshot({ path: path.join(SCREENSHOT_DIR, '01_register_guest_only.png'), fullPage: true });
  console.log('Captured 01_register_guest_only.png');

  console.log('\n=== TEST 2: ADMIN NAVIGATION & RBAC USER ACCESS ===');
  const context2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page2 = await context2.newPage();
  await page2.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page2.fill('input[type="text"]', 'admin');
  await page2.fill('input[type="password"]', '123');
  await page2.click('button:has-text("Sign In")');
  await page2.waitForURL('**/admin', { timeout: 10000 });
  await page2.waitForTimeout(1000);

  // Capture Admin home showing "Staff" and "Reports" in nav
  await page2.screenshot({ path: path.join(SCREENSHOT_DIR, '02_admin_nav_labels.png'), fullPage: true });
  console.log('Captured 02_admin_nav_labels.png');

  // Navigate to Access & Roles tab
  const accessTab = page2.locator('button:has-text("Access & Roles")').first();
  await accessTab.click();
  await page2.waitForTimeout(1000);
  await page2.screenshot({ path: path.join(SCREENSHOT_DIR, '03_admin_rbac_panel.png'), fullPage: true });
  console.log('Captured 03_admin_rbac_panel.png');

  console.log('\n=== TEST 3: GUEST DASHBOARD SUITE RESERVATION & PAYMENT GATEWAYS ===');
  const context3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page3 = await context3.newPage();
  await page3.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page3.fill('input[type="text"]', 'new_guest');
  await page3.fill('input[type="password"]', '123');
  await page3.click('button:has-text("Sign In")');
  await page3.waitForURL('**/dashboard', { timeout: 10000 });
  await page3.waitForTimeout(1000);

  // Click "Explore Suites" tab
  const exploreTab = page3.locator('button:has-text("Explore Suites")').first();
  await exploreTab.click();
  await page3.waitForTimeout(800);

  // Set check-in and check-out dates
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const checkout = new Date(today);
  checkout.setDate(today.getDate() + 10);

  const checkinInput = page3.locator('input[type="date"]').first();
  const checkoutInput = page3.locator('input[type="date"]').nth(1);
  await checkinInput.fill(nextWeek.toISOString().split('T')[0]);
  await checkoutInput.fill(checkout.toISOString().split('T')[0]);

  // Click Reserve Suite on first available room
  const reserveBtn = page3.locator('button:has-text("Reserve Suite")').first();
  await reserveBtn.click();
  await page3.waitForTimeout(800);

  // Booking details modal is open
  await page3.screenshot({ path: path.join(SCREENSHOT_DIR, '04_guest_booking_modal.png') });
  console.log('Captured 04_guest_booking_modal.png');

  // Case A: Proceed to UPI Scan & Pay
  const proceedPaymentBtn = page3.locator('button:has-text("Proceed to UPI Scan & Pay")');
  await proceedPaymentBtn.click();
  await page3.waitForTimeout(1000);

  // Screenshot UPI QR code gateway modal
  await page3.screenshot({ path: path.join(SCREENSHOT_DIR, '05_guest_upi_qr_gateway.png') });
  console.log('Captured 05_guest_upi_qr_gateway.png');

  // Cancel UPI to test Card flow
  const cancelBtn = page3.locator('button:has-text("Cancel")').first();
  await cancelBtn.click();
  await page3.waitForTimeout(500);

  // Re-open booking modal and select Card
  await reserveBtn.click();
  await page3.waitForTimeout(500);
  await page3.locator('button:has-text("Credit / Debit Card")').click();
  await page3.waitForTimeout(300);

  // Click Proceed to Card Settlement
  await page3.locator('button:has-text("Proceed to Card Settlement")').click();
  await page3.waitForTimeout(1000);

  // Screenshot Luxury Gold Card modal
  await page3.screenshot({ path: path.join(SCREENSHOT_DIR, '06_guest_card_gateway.png') });
  console.log('Captured 06_guest_card_gateway.png');

  // Complete Payment with Card
  const payCardBtn = page3.locator('button:has-text("Authorize & Pay")');
  await payCardBtn.click();

  // Wait for payment authorization & redirect to Stays tab
  await page3.waitForTimeout(3500);
  await page3.screenshot({ path: path.join(SCREENSHOT_DIR, '07_guest_booking_confirmed.png'), fullPage: true });
  console.log('Captured 07_guest_booking_confirmed.png');

  await browser.close();
  console.log('All tests completed successfully!');
})();
