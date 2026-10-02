const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🚀 Starting end-to-end verification of user requirements...');
  const outDir = path.join(__dirname, 'screenshots', 'final_verification');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Check Guest login and Booking flow KYC + OTP
    console.log('--- 1. Testing Guest Login and Mandatory Phone OTP & KYC ---');
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="text"]', 'new_guest');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('Logged into /dashboard');

    // Click 'Explore Suites' to see available rooms
    await page.click('button:has-text("Explore Suites")');
    await page.waitForTimeout(800);

    // Click Reserve Suite on first available room
    await page.waitForSelector('text=Reserve Suite', { timeout: 10000 });
    const reserveBtns = await page.$$('text=Reserve Suite');
    if (reserveBtns.length > 0) {
      await reserveBtns[0].click();
    }
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '01_guest_booking_modal_with_kyc_and_otp.png'), fullPage: true });

    // Try proceeding without OTP & KYC -> should show gate error
    const proceedBtn = await page.waitForSelector('text=Proceed to UPI Scan & Pay', { timeout: 5000 });
    await proceedBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, '02_guest_booking_gate_error.png') });

    // Enter phone and send OTP
    console.log('Testing phone OTP flow...');
    const phoneInput = await page.$('input[placeholder="+91 98765 43210"]');
    await phoneInput.fill('+91 9876543210');
    await page.click('text=Send OTP');
    await page.waitForTimeout(800);

    // Read the OTP displayed in notice
    const noticeText = await page.innerText('text=OTP Sent to');
    const otpMatch = noticeText.match(/:\s*(\d{6})/);
    const otpCode = otpMatch ? otpMatch[1] : '123456';
    console.log(`Generated OTP code: ${otpCode}`);

    // Fill OTP and verify
    await page.fill('input[placeholder="Enter 6-digit OTP"]', otpCode);
    await page.click('button:has-text("Verify OTP")');
    await page.waitForTimeout(500);

    // Fill Government ID KYC
    console.log('Testing Government ID KYC verification...');
    const idInput = await page.$('input[placeholder="e.g. 1234 5678 9012"]');
    await idInput.fill('5421 9876 1234');
    const nameInput = await page.$('input[placeholder="Name as on document"]');
    await nameInput.fill('Gopi Cyber Verified');
    await page.click('button:has-text("Verify ID")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, '03_guest_kyc_and_phone_verified.png') });

    // Select Pay on Arrival and confirm reservation
    await page.click('button:has-text("Pay on Arrival")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Confirm Reservation")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outDir, '04_guest_reservation_confirmed.png'), fullPage: true });

    // 2. Check Admin view
    console.log('--- 2. Testing Admin Dashboard (Read-only KYC, Clean Titles, Custom Role) ---');
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin', { timeout: 10000 });
    console.log('Logged into /admin');

    // Check Guest Records (Reservations) tab to see the Verified badge
    await page.click('button:has-text("Guest Records")');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, '05_admin_reservations_verified_badge.png'), fullPage: true });

    // Check Staff tab
    await page.click('button:has-text("Staff")');
    await page.waitForTimeout(800);

    // Open Add Staff modal
    await page.click('button:has-text("Add Staff Member")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, '06_admin_add_staff_custom_role.png') });

    // Fill custom role
    await page.fill('input[placeholder="e.g. Liam Sterling"]', 'Chef Alessandro');
    await page.fill('input[placeholder="liam@luxestay.com"]', 'alessandro@luxestay.com');
    await page.fill('input[placeholder="e.g. Concierge, Chef, Bartender..."]', 'Executive Head Chef');
    await page.selectOption('select:has-text("Morning")', 'Night');
    await page.click('button[type="submit"]:has-text("Add Staff")');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, '07_admin_staff_with_custom_role_added.png'), fullPage: true });

    // Check Access & Roles tab to verify explanation cards are removed
    await page.click('button:has-text("Access & Roles")');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, '08_admin_clean_rbac_tab.png'), fullPage: true });

    // Check Admin Profile modal (no brand crest presets, initial letter fallback)
    await page.click('button:has-text("Admin • Profile")');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, '09_admin_profile_modal_clean.png') });

    console.log('✅ All verification steps executed successfully.');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    await page.screenshot({ path: path.join(outDir, 'error.png') });
    process.exit(1);
  } finally {
    await browser.close();
  }
})();