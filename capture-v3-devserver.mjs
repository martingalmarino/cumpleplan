import { chromium } from 'playwright';
import { copyFileSync } from 'fs';

async function captureV3Screenshots() {
  const browser = await chromium.launch();
  const storeDir = '/cursor/stores/self/artifacts/screenshots';
  const baseUrl = 'http://localhost:4321';
  
  // Desktop context (1440x1200 for listing)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 1200 }
  });
  const desktopPage = await desktopContext.newPage();
  
  // 1. Listing desktop
  await desktopPage.goto(`${baseUrl}/directorio/cordoba/cordoba/`);
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(1500);
  await desktopPage.evaluate(() => window.scrollTo(0, 0));
  await desktopPage.waitForTimeout(300);
  const listingDesktopPath = 'v3-listing-desktop.png';
  await desktopPage.screenshot({ path: listingDesktopPath, fullPage: false });
  copyFileSync(listingDesktopPath, `${storeDir}/${listingDesktopPath}`);
  console.log(`✓ ${listingDesktopPath} (22KB → ${(await import('fs')).statSync(listingDesktopPath).size} bytes)`);
  
  // 2. Provider desktop
  await desktopPage.setViewportSize({ width: 1440, height: 900 });
  await desktopPage.goto(`${baseUrl}/proveedor/candy-jump/`);
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(1500);
  const providerDesktopPath = 'v3-provider-no-photos-desktop.png';
  await desktopPage.screenshot({ path: providerDesktopPath, fullPage: false });
  copyFileSync(providerDesktopPath, `${storeDir}/${providerDesktopPath}`);
  console.log(`✓ ${providerDesktopPath}`);
  
  await desktopContext.close();
  
  // Mobile context (390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const mobilePage = await mobileContext.newPage();
  
  // 3. Listing mobile
  await mobilePage.goto(`${baseUrl}/directorio/cordoba/cordoba/`);
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(1500);
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(300);
  const listingMobilePath = 'v3-listing-mobile.png';
  await mobilePage.screenshot({ path: listingMobilePath, fullPage: false });
  copyFileSync(listingMobilePath, `${storeDir}/${listingMobilePath}`);
  console.log(`✓ ${listingMobilePath}`);
  
  // 4. Listing mobile with filters button visible
  await mobilePage.evaluate(() => window.scrollTo(0, 400));
  await mobilePage.waitForTimeout(500);
  const filtersPath = 'v3-listing-mobile-filters-open.png';
  await mobilePage.screenshot({ path: filtersPath, fullPage: false });
  copyFileSync(filtersPath, `${storeDir}/${filtersPath}`);
  console.log(`✓ ${filtersPath}`);
  
  // 5. Provider mobile
  await mobilePage.goto(`${baseUrl}/proveedor/candy-jump/`);
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(1500);
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(300);
  const providerMobilePath = 'v3-provider-no-photos-mobile.png';
  await mobilePage.screenshot({ path: providerMobilePath, fullPage: false });
  copyFileSync(providerMobilePath, `${storeDir}/${providerMobilePath}`);
  console.log(`✓ ${providerMobilePath}`);
  
  await mobileContext.close();
  await browser.close();
  
  console.log(`\n✅ All v3 screenshots saved to:\n   ${storeDir}/`);
}

captureV3Screenshots().catch(console.error);
