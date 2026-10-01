const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, 'screenshots/currency_admin_profile');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('--- 1. Login as Admin ---');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', '123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin', { timeout: 10000 });
  await page.waitForTimeout(1500);

  console.log('--- 2. Verify Currency in Admin ---');
  // Check initial currency (INR ₹)
  const getKpiCardText = async (label) => {
    return await page.locator(`text=${label}`).locator('xpath=ancestor::div[contains(@class, "rounded-2xl")]').innerText();
  };

  let kpiText = await getKpiCardText('Gross Lodging Folio');
  console.log('Admin initial KPI text:\n', kpiText);
  await page.screenshot({ path: path.join(OUT_DIR, '01_admin_inr.png') });

  // Change currency to USD
  console.log('Changing currency to USD...');
  await page.locator('select[aria-label="Currency"]').first().selectOption('USD');
  await page.waitForTimeout(1000);
  kpiText = await getKpiCardText('Gross Lodging Folio');
  console.log('Admin USD KPI text:\n', kpiText);
  if (!kpiText.includes('$')) {
    throw new Error('USD symbol $ not found in Admin KPI!');
  }
  await page.screenshot({ path: path.join(OUT_DIR, '02_admin_usd.png') });

  // Change currency to EUR
  console.log('Changing currency to EUR...');
  await page.locator('select[aria-label="Currency"]').first().selectOption('EUR');
  await page.waitForTimeout(1000);
  kpiText = await getKpiCardText('Gross Lodging Folio');
  console.log('Admin EUR KPI text:\n', kpiText);
  if (!kpiText.includes('€')) {
    throw new Error('EUR symbol € not found in Admin KPI!');
  }
  await page.screenshot({ path: path.join(OUT_DIR, '03_admin_eur.png') });

  console.log('--- 3. Click Admin Photo to open Admin Profile Modal ---');
  // Click admin photo button in top header or sidebar
  const adminPhotoBtn = page.locator('button[title="Open Admin & Company Profile"]').first();
  await adminPhotoBtn.click();
  await page.waitForTimeout(1000);

  // Verify modal is open
  const modalHeader = await page.locator('text=Executive Administration & Corporate Profile');
  const isModalVisible = await modalHeader.isVisible();
  console.log('Admin Profile Modal Visible:', isModalVisible);
  if (!isModalVisible) {
    throw new Error('Admin profile modal did not open!');
  }
  await page.screenshot({ path: path.join(OUT_DIR, '04_admin_profile_tab1.png') });

  // Switch to Company & Logo tab
  console.log('Testing Company & Logo tab...');
  await page.locator('button:has-text("Company & Logo")').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, '05_admin_company_tab2.png') });

  // Select a preset logo
  const logoPresets = page.locator('button:has-text("Luxury Heritage Crest")');
  if (await logoPresets.isVisible()) {
    await logoPresets.click();
    console.log('Clicked Luxury Heritage Crest logo preset');
  }

  // Switch to Hotel Operations tab
  console.log('Testing Hotel Operations tab...');
  await page.locator('button:has-text("Hotel Operations")').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, '06_admin_operations_tab3.png') });

  // Click Save Profile & Logo
  console.log('Saving profile...');
  await page.click('button:has-text("Save Profile & Logo")');
  await page.waitForTimeout(1000);
  const successToast = await page.locator('text=saved successfully').isVisible();
  console.log('Save success toast visible:', successToast);
  if (!successToast) {
    throw new Error('Save profile success toast did not show!');
  }
  await page.screenshot({ path: path.join(OUT_DIR, '07_admin_profile_saved.png') });

  // Close modal
  await page.click('button:has-text("Close")');
  await page.waitForTimeout(500);

  // Also test clicking sidebar admin profile avatar
  console.log('Testing sidebar avatar click...');
  const sidebarAvatar = page.locator('button[title="Click to view/edit Admin & Company Profile"]').first();
  await sidebarAvatar.click();
  await page.waitForTimeout(1000);
  const isModalVisibleAgain = await page.locator('text=Executive Administration & Corporate Profile').isVisible();
  console.log('Sidebar Avatar Click opened modal:', isModalVisibleAgain);
  if (!isModalVisibleAgain) {
    throw new Error('Sidebar avatar did not open modal!');
  }
  await page.click('button:has-text("Close")');
  await page.waitForTimeout(500);

  console.log('--- 4. Verify Currency in Receptionist View ---');
  // Log out of admin
  await page.click('button[title="Sign out"]');
  await page.waitForURL('**/login', { timeout: 10000 });
  await page.waitForTimeout(1000);

  // Log in as staff (receptionist)
  console.log('Logging in as staff (receptionist)...');
  await page.fill('input[type="text"]', 'staff');
  await page.fill('input[type="password"]', '123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/receptionist', { timeout: 10000 });
  await page.waitForTimeout(1500);

  // Check Receptionist currency displays
  let recKpi = await getKpiCardText('Settled Folio Revenue');
  console.log('Receptionist initial KPI text:\n', recKpi);

  // Switch to USD in receptionist
  console.log('Changing currency to USD in Receptionist...');
  await page.locator('select[aria-label="Currency"]').first().selectOption('USD');
  await page.waitForTimeout(1000);
  recKpi = await getKpiCardText('Settled Folio Revenue');
  console.log('Receptionist USD KPI text:\n', recKpi);
  if (!recKpi.includes('$')) {
    throw new Error('USD symbol $ not found in Receptionist KPI!');
  }
  await page.screenshot({ path: path.join(OUT_DIR, '08_receptionist_usd.png') });

  // Switch to GBP in receptionist
  console.log('Changing currency to GBP in Receptionist...');
  await page.locator('select[aria-label="Currency"]').first().selectOption('GBP');
  await page.waitForTimeout(1000);
  recKpi = await getKpiCardText('Settled Folio Revenue');
  console.log('Receptionist GBP KPI text:\n', recKpi);
  if (!recKpi.includes('£')) {
    throw new Error('GBP symbol £ not found in Receptionist KPI!');
  }
  await page.screenshot({ path: path.join(OUT_DIR, '09_receptionist_gbp.png') });

  // Check Room Rack price tags in Receptionist
  await page.click('button:has-text("Room Rack")');
  await page.waitForTimeout(1000);
  const roomRackLocator = page.locator('text=/ night').first();
  const roomPriceText = await roomRackLocator.locator('..').innerText();
  console.log('Room Rack price text in GBP:', roomPriceText);
  if (!roomPriceText.includes('£')) {
    throw new Error('Room Rack price does not show GBP £!');
  }
  await page.screenshot({ path: path.join(OUT_DIR, '10_receptionist_room_rack_gbp.png') });

  console.log('--- ALL AUTOMATED VERIFICATIONS PASSED WITH 100% SUCCESS! ---');
  await browser.close();
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
