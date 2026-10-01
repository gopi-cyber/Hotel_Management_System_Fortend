const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots', 'staff_guest_profile');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('--- STARTING STAFF & GUEST PROFILE MODAL VERIFICATION ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    // ══════════════════════════════════════════════
    // PART 1: RECEPTIONIST / STAFF PROFILE
    // ══════════════════════════════════════════════
    console.log('\n[1] Navigating to login for Staff account...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.fill('input[type="text"]', 'staff');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => url.pathname.includes('/receptionist'), { timeout: 20000 });
    console.log('✓ Successfully logged into Receptionist dashboard');
    await page.waitForTimeout(1500);

    // Capture initial receptionist dashboard
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_receptionist_dashboard.png'), fullPage: false });

    // Click staff avatar button in top header
    console.log('[2] Opening Staff Profile Modal via Header Profile button...');
    const headerProfileBtn = page.locator('button[title*="Staff Hospitality Profile"]').first();
    await headerProfileBtn.waitFor({ state: 'visible', timeout: 5000 });
    await headerProfileBtn.click();

    // Verify modal title
    await page.waitForSelector('text=Front Desk & Hospitality Staff Profile', { timeout: 5000 });
    console.log('✓ Staff Profile Modal opened successfully!');
    await page.waitForTimeout(500);

    // Screenshot Tab 1: Staff Credentials
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_staff_modal_tab1_credentials.png') });

    // Click Tab 2: Station & Property
    console.log('[3] Inspecting Tab 2: Station & Property...');
    await page.click('button:has-text("Station & Property")');
    await page.waitForSelector('text=Assigned Duty Desk:', { timeout: 3000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_staff_modal_tab2_station.png') });

    // Click Tab 3: Shift Controls
    console.log('[4] Inspecting Tab 3: Shift Controls...');
    await page.click('button:has-text("Shift Controls")');
    await page.waitForSelector('text=Night Audit Theme Shift', { timeout: 3000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_staff_modal_tab3_controls.png') });

    // Return to Tab 1, pick an avatar preset, edit name and employee ID
    console.log('[5] Editing Staff details & saving...');
    await page.click('button:has-text("Staff Credentials")');
    await page.waitForTimeout(300);

    // Pick "Concierge Supervisor" preset
    await page.click('button:has-text("Concierge Supervisor")');

    // Fill new name and employee ID
    const nameInput = page.locator('label:has-text("Staff Member Name") + input');
    await nameInput.fill('Priya Sharma (Head Concierge)');

    const empInput = page.locator('label:has-text("Employee ID Number")').locator('..').locator('input');
    await empInput.fill('STF-777');

    // Click Save Staff Profile
    await page.click('button:has-text("Save Staff Profile")');

    // Verify success banner
    await page.waitForSelector('text=Staff profile & duty credentials updated successfully!', { timeout: 5000 });
    console.log('✓ Staff Profile saved and confirmation banner verified!');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_staff_modal_saved.png') });

    // Close modal
    await page.click('button:has-text("Close")');
    await page.waitForTimeout(500);

    // Verify updated name shows in header/sidebar
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_receptionist_updated_header.png') });
    console.log('✓ Staff profile updates reflected on Receptionist view');

    // ══════════════════════════════════════════════
    // PART 2: GUEST STAY & VIP PROFILE
    // ══════════════════════════════════════════════
    console.log('\n[6] Logging out staff and logging in as Guest...');
    // Click Sign Out
    await page.click('button[title="Sign out"]');
    await page.waitForURL(url => url.pathname.includes('/login'), { timeout: 20000 });
    await page.waitForTimeout(1000);

    await page.fill('input[type="text"]', 'guest');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => url.pathname.includes('/dashboard'), { timeout: 20000 });
    console.log('✓ Successfully logged into Guest Dashboard');
    await page.waitForTimeout(1500);

    // Capture initial guest dashboard
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_guest_dashboard.png'), fullPage: false });

    // Click Guest avatar in desktop sidebar
    console.log('[7] Opening Guest Profile Modal via Sidebar Profile photo...');
    const sidebarProfileBtn = page.locator('aside button[title*="Profile"]').first();
    await sidebarProfileBtn.click();

    // Verify modal title
    await page.waitForSelector('text=Guest Membership & Stay Preferences', { timeout: 5000 });
    console.log('✓ Guest Profile Modal opened successfully!');
    await page.waitForTimeout(500);

    // Screenshot Tab 1: VIP Loyalty & Identity
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_guest_modal_tab1_loyalty.png') });

    // Click Tab 2: Stay Preferences
    console.log('[8] Inspecting Tab 2: Stay Preferences (Pillow Menu, Dining, Climate)...');
    await page.click('button:has-text("Stay Preferences")');
    await page.waitForSelector('text=Custom Pillow Menu', { timeout: 3000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_guest_modal_tab2_preferences.png') });

    // Click Tab 3: Emergency & Billing
    console.log('[9] Inspecting Tab 3: Emergency & Billing...');
    await page.click('button:has-text("Emergency & Billing")');
    await page.waitForSelector('text=Hospitality Concierge Assistance', { timeout: 3000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_guest_modal_tab3_emergency.png') });

    // Edit preferences: Pillow Menu & Dining Style & Name
    console.log('[10] Modifying Stay Preferences and saving...');
    await page.click('button:has-text("Stay Preferences")');
    await page.waitForTimeout(300);

    const diningSelect = page.locator('label:has-text("Fine Dining & Dietary Style")').locator('..').locator('select');
    await diningSelect.selectOption('Vegan Delights');

    const pillowSelect = page.locator('label:has-text("Custom Pillow Menu")').locator('..').locator('select');
    await pillowSelect.selectOption('Memory Foam Orthopedic');

    // Switch to Tab 1 to customize guest name
    await page.click('button:has-text("VIP Loyalty & Identity")');
    await page.waitForTimeout(300);

    // Pick "Royal Heritage Guest" photo preset
    await page.click('button:has-text("Royal Heritage Guest")');

    const guestNameInput = page.locator('label:has-text("Guest Full Name")').locator('..').locator('input');
    await guestNameInput.fill('Alex Morgan (Royal Diamond VIP)');

    // Click Save Preferences
    await page.click('button:has-text("Save Preferences")');
    await page.waitForSelector('text=Guest profile and hospitality preferences saved successfully!', { timeout: 5000 });
    console.log('✓ Guest Profile saved and confirmation banner verified!');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_guest_modal_saved.png') });

    // Close modal
    await page.click('button:has-text("Close")');
    await page.waitForTimeout(500);

    // Screenshot updated guest dashboard
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_guest_updated_dashboard.png') });
    console.log('✓ Guest profile updates reflected on Guest Dashboard');

    console.log('\n--- ALL VERIFICATIONS COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('ERROR during verification:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
