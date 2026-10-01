const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, 'screenshots/header_cleanup_and_photo_upload');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Create a small 1x1 base64 png file for file upload testing
const testImgPath = path.resolve(OUT_DIR, 'test_avatar.png');
const png1x1Base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
fs.writeFileSync(testImgPath, Buffer.from(png1x1Base64, 'base64'));

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    console.log('=== TEST 1: ADMIN PAGE CLEAN HEADER & ADMIN PROFILE PHOTO UPLOAD ===');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => url.pathname.includes('/admin'), { timeout: 20000 });
    await page.waitForTimeout(1000);

    // Verify top header has NO night audit, NO currency selector, NO profile pill
    console.log('[1.1] Verifying desktop top header is clean...');
    const topBar = page.locator('main > div:first-child');
    const headerNightAudit = topBar.locator('button:has-text("Night Audit"), button:has-text("Day Shift")');
    const headerCurrency = topBar.locator('select');
    const headerProfileBtn = topBar.locator('button[title*="Profile"]');

    console.log('Top header Night Audit count:', await headerNightAudit.count());
    console.log('Top header Currency select count:', await headerCurrency.count());
    console.log('Top header Profile button count:', await headerProfileBtn.count());

    if (await headerNightAudit.count() !== 0 || await headerCurrency.count() !== 0 || await headerProfileBtn.count() !== 0) {
      throw new Error('Top header still contains Night Audit, Currency, or Profile buttons!');
    }

    await page.screenshot({ path: path.join(OUT_DIR, '01_admin_clean_header.png') });

    // Open Admin Profile via Sidebar user card
    console.log('[1.2] Opening Admin Profile Modal via Sidebar user card...');
    const sidebarUserCard = page.locator('aside button[title*="Admin & Corporate Profile"]');
    await sidebarUserCard.click();
    await page.waitForSelector('text=Executive Administration & Corporate Profile', { timeout: 5000 });

    // Verify NO "Custom Photo URL" text input
    const photoUrlInput = page.locator('input[placeholder*="example.com/avatar"]');
    console.log('Custom Photo URL input count:', await photoUrlInput.count());
    if (await photoUrlInput.count() !== 0) {
      throw new Error('Found Custom Photo URL text input in Admin Profile!');
    }

    // Verify File Upload input exists
    const fileInput = page.locator('input[type="file"]').first();
    console.log('File upload input exists:', await fileInput.count() > 0);

    // Upload test avatar image
    await fileInput.setInputFiles(testImgPath);
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(OUT_DIR, '02_admin_photo_uploaded.png') });

    // Save Profile
    await page.click('button:has-text("Save Profile & Logo")');
    await page.waitForSelector('text=Corporate Profile and Brand details saved successfully!', { timeout: 5000 });
    await page.screenshot({ path: path.join(OUT_DIR, '03_admin_saved.png') });

    // Close Modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    console.log('\n=== TEST 2: STAFF PAGE CLEAN HEADER & STAFF PROFILE PHOTO UPLOAD ===');
    // Log out from admin
    await page.click('aside button[title="Sign out"]');
    await page.waitForURL(url => url.pathname.includes('/login'), { timeout: 20000 });
    await page.waitForTimeout(1000);

    // Login as staff
    await page.fill('input[type="text"]', 'staff');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => url.pathname.includes('/receptionist'), { timeout: 20000 });
    await page.waitForTimeout(1000);

    // Verify receptionist top header is clean
    const staffTopBar = page.locator('main > div:first-child');
    console.log('[2.1] Verifying Staff top header is clean...');
    console.log('Staff top header Night Audit count:', await staffTopBar.locator('button:has-text("Night Audit"), button:has-text("Day Shift")').count());
    console.log('Staff top header Currency count:', await staffTopBar.locator('select').count());
    console.log('Staff top header Profile count:', await staffTopBar.locator('button[title*="Profile"]').count());

    await page.screenshot({ path: path.join(OUT_DIR, '04_staff_clean_header.png') });

    // Open Staff Profile via Sidebar
    console.log('[2.2] Opening Staff Profile Modal via Sidebar user card...');
    const staffSidebarCard = page.locator('aside button[title*="Staff Hospitality Profile"]');
    await staffSidebarCard.click();
    await page.waitForSelector('text=Front Desk & Hospitality Staff Profile', { timeout: 5000 });

    // Verify NO Custom Photo URL input
    const staffPhotoUrlInput = page.locator('input[placeholder*="example.com/staff"]');
    if (await staffPhotoUrlInput.count() !== 0) {
      throw new Error('Found Custom Photo URL text input in Staff Profile!');
    }

    // Upload test avatar
    const staffFileInput = page.locator('input[type="file"]').first();
    await staffFileInput.setInputFiles(testImgPath);
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(OUT_DIR, '05_staff_photo_uploaded.png') });

    // Save Staff Profile
    await page.click('button:has-text("Save Staff Profile")');
    await page.waitForSelector('text=Staff profile & duty credentials updated successfully!', { timeout: 5000 });
    await page.screenshot({ path: path.join(OUT_DIR, '06_staff_saved.png') });

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    console.log('\n=== TEST 3: GUEST PAGE CLEAN HEADER & GUEST PROFILE PHOTO UPLOAD ===');
    // Log out from staff
    await page.click('aside button[title="Sign out"]');
    await page.waitForURL(url => url.pathname.includes('/login'), { timeout: 20000 });
    await page.waitForTimeout(1000);

    // Login as guest
    await page.fill('input[type="text"]', 'guest');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => url.pathname.includes('/dashboard'), { timeout: 20000 });
    await page.waitForTimeout(1000);

    // Verify guest top header is clean
    const guestTopBar = page.locator('main > div:first-child');
    console.log('[3.1] Verifying Guest top header is clean...');
    console.log('Guest top header Night Audit count:', await guestTopBar.locator('button:has-text("Night Audit"), button:has-text("Day Shift")').count());
    console.log('Guest top header Currency count:', await guestTopBar.locator('select').count());
    console.log('Guest top header Profile count:', await guestTopBar.locator('button[title*="Profile"]').count());

    await page.screenshot({ path: path.join(OUT_DIR, '07_guest_clean_header.png') });

    // Open Guest Profile via Sidebar
    console.log('[3.2] Opening Guest Profile Modal via Sidebar user card...');
    const guestSidebarCard = page.locator('aside button[title*="Guest Stay & Loyalty Profile"]');
    await guestSidebarCard.click();
    await page.waitForSelector('text=Guest Membership & Stay Preferences', { timeout: 5000 });

    // Verify NO Custom Photo URL input
    const guestPhotoUrlInput = page.locator('input[placeholder*="example.com/photo"]');
    if (await guestPhotoUrlInput.count() !== 0) {
      throw new Error('Found Custom Photo URL text input in Guest Profile!');
    }

    // Upload test avatar
    const guestFileInput = page.locator('input[type="file"]').first();
    await guestFileInput.setInputFiles(testImgPath);
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(OUT_DIR, '08_guest_photo_uploaded.png') });

    // Save Guest Profile
    await page.click('button:has-text("Save Preferences")');
    await page.waitForSelector('text=Guest profile and hospitality preferences saved successfully!', { timeout: 5000 });
    await page.screenshot({ path: path.join(OUT_DIR, '09_guest_saved.png') });

    console.log('\n--- ALL VERIFICATIONS COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Test failed:', err);
    await page.screenshot({ path: path.join(OUT_DIR, 'error_state.png') });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
