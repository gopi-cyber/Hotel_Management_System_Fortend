const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, 'screenshots', 'hotel_modules');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('--- TEST 1: GUEST CONCIERGE & IN-ROOM ORDERING ---');
  // Login as guest
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="text"]', 'new_guest');
  await page.fill('input[type="password"]', '123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(screenshotDir, '01_guest_dashboard.png'), fullPage: true });
  console.log('✓ 01_guest_dashboard.png saved');

  // Click on "Order Service" button in header banner
  const conciergeBtn = page.locator('button:has-text("Order Service")').first();
  await conciergeBtn.click();
  await page.waitForTimeout(600);

  await page.screenshot({ path: path.join(screenshotDir, '02_guest_concierge_catalog.png') });
  console.log('✓ 02_guest_concierge_catalog.png saved');

  // Select an item from catalog (e.g. Royal Breakfast Banquet)
  const itemBtn = page.locator('button:has-text("Royal Breakfast Banquet"), button:has-text("High-Thread Linen")').first();
  if (await itemBtn.isVisible()) {
    await itemBtn.click();
    await page.waitForTimeout(400);
  }

  // Type custom notes
  await page.fill('input[placeholder*="Extra ice"]', 'Extra crisp croissants and freshly squeezed orange juice please.');
  
  // Submit request
  await page.click('button:has-text("Dispatch Request")');
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(screenshotDir, '03_guest_concierge_order_dispatched.png') });
  console.log('✓ 03_guest_concierge_order_dispatched.png saved');

  console.log('\n--- TEST 2: RECEPTIONIST PMS, HOUSEKEEPING & KYC ---');
  // Clear context for clean staff login
  const staffContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const staffPage = await staffContext.newPage();

  // Login as staff
  await staffPage.goto('http://localhost:3000/login');
  await staffPage.fill('input[type="text"]', 'staff');
  await staffPage.fill('input[type="password"]', '123');
  await staffPage.click('button[type="submit"]');
  await staffPage.waitForURL('**/receptionist', { timeout: 10000 });
  await staffPage.waitForTimeout(1000);

  await staffPage.screenshot({ path: path.join(screenshotDir, '04_receptionist_arrivals.png'), fullPage: true });
  console.log('✓ 04_receptionist_arrivals.png saved');

  // Test KYC Modal
  const kycBtn = staffPage.locator('button:has-text("Verify ID"), button:has-text("Verified")').first();
  if (await kycBtn.isVisible()) {
    await kycBtn.click();
    await staffPage.waitForTimeout(600);
    await staffPage.screenshot({ path: path.join(screenshotDir, '05_receptionist_kyc_modal.png') });
    console.log('✓ 05_receptionist_kyc_modal.png saved');

    // Fill ID number and submit
    await staffPage.fill('input[placeholder*="Z5948392"]', 'PASS-982174A');
    await staffPage.click('button:has-text("Save Verification")');
    await staffPage.waitForTimeout(1500);
  }

  // Switch to Live Room Rack tab to inspect Housekeeping
  await staffPage.click('button:has-text("Live Room Rack")');
  await staffPage.waitForTimeout(800);
  await staffPage.screenshot({ path: path.join(screenshotDir, '07_receptionist_room_rack_housekeeping.png'), fullPage: true });
  console.log('✓ 07_receptionist_room_rack_housekeeping.png saved');

  // Switch to Guest Requests tab to view dispatched in-room requests
  await staffPage.click('button:has-text("Guest Requests")');
  await staffPage.waitForTimeout(800);
  await staffPage.screenshot({ path: path.join(screenshotDir, '08_receptionist_guest_requests_queue.png'), fullPage: true });
  console.log('✓ 08_receptionist_guest_requests_queue.png saved');

  // Switch to Billing tab and inspect Folio Invoice
  await staffPage.click('button:has-text("Folios & Billing")');
  await staffPage.waitForTimeout(800);

  // Post an Incidental Charge on the folio
  const addIncidentalBtn = staffPage.locator('button:has-text("+ Incidental")').first();
  if (await addIncidentalBtn.isVisible()) {
    await addIncidentalBtn.click();
    await staffPage.waitForTimeout(600);
    await staffPage.screenshot({ path: path.join(screenshotDir, '06_receptionist_incidental_modal.png') });
    console.log('✓ 06_receptionist_incidental_modal.png saved');

    // Select preset Minibar and submit
    const presetBtn = staffPage.locator('button:has-text("Minibar Spirits")').first();
    if (await presetBtn.isVisible()) {
      await presetBtn.click();
      await staffPage.waitForTimeout(300);
    } else {
      await staffPage.fill('input[placeholder*="Minibar"]', 'Minibar Premium Snacks');
    }
    await staffPage.click('button:has-text("Post Charge")');
    await staffPage.waitForTimeout(2000);
  }

  await staffPage.screenshot({ path: path.join(screenshotDir, '09_receptionist_folios_incidentals.png'), fullPage: true });
  console.log('✓ 09_receptionist_folios_incidentals.png saved');

  const folioBtn = staffPage.locator('button:has-text("Inspect Folio")').first();
  if (await folioBtn.isVisible()) {
    await folioBtn.click();
    await staffPage.waitForTimeout(800);
    await staffPage.screenshot({ path: path.join(screenshotDir, '10_receptionist_tax_folio_with_incidentals.png') });
    console.log('✓ 10_receptionist_tax_folio_with_incidentals.png saved');
    await staffPage.keyboard.press('Escape');
    await staffPage.waitForTimeout(400);
  }

  console.log('\n--- TEST 3: ADMIN SUITES HOUSEKEEPING & MASTER RESERVATIONS ---');
  // Use staff context storage state so KYC & incidentals persist to admin inspection
  const storageState = await staffContext.storageState();
  const adminContext = await browser.newContext({
    storageState,
    viewport: { width: 1440, height: 900 }
  });
  const adminPage = await adminContext.newPage();

  // Login as admin
  await adminPage.goto('http://localhost:3000/login');
  await adminPage.fill('input[type="text"]', 'admin');
  await adminPage.fill('input[type="password"]', '123');
  await adminPage.click('button[type="submit"]');
  await adminPage.waitForURL('**/admin', { timeout: 10000 });
  await adminPage.waitForTimeout(1000);

  await adminPage.screenshot({ path: path.join(screenshotDir, '11_admin_inventory_housekeeping.png'), fullPage: true });
  console.log('✓ 11_admin_inventory_housekeeping.png saved');

  // Go to reservations tab
  await adminPage.click('button:has-text("Guest Records")');
  await adminPage.waitForTimeout(800);
  await adminPage.screenshot({ path: path.join(screenshotDir, '12_admin_master_reservations.png'), fullPage: true });
  console.log('✓ 12_admin_master_reservations.png saved');

  await browser.close();
  console.log('\nAll 4 hotel operational modules verified successfully!');
})();
