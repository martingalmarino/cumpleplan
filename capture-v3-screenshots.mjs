import { chromium } from 'playwright';
import { copyFileSync } from 'fs';

async function takeScreenshots() {
  const browser = await chromium.launch();
  const storeDir = '/cursor/stores/self/artifacts/screenshots';
  
  // Desktop screenshots (1440x1200 for listing to show green header)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 1200 }
  });
  const desktopPage = await desktopContext.newPage();
  
  // 1. Listing desktop with green header visible
  await desktopPage.goto('http://localhost:8080/directorio/cordoba/cordoba/');
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.evaluate(() => window.scrollTo(0, 0));
  await desktopPage.waitForTimeout(500);
  const listingDesktopPath = 'v3-listing-desktop.png';
  await desktopPage.screenshot({ path: listingDesktopPath, fullPage: false });
  copyFileSync(listingDesktopPath, `${storeDir}/${listingDesktopPath}`);
  console.log(`✓ Captured ${listingDesktopPath}`);
  console.log(`  Copied to ${storeDir}/${listingDesktopPath}`);
  
  // 2. Provider without photos desktop (900px height)
  await desktopPage.setViewportSize({ width: 1440, height: 900 });
  await desktopPage.goto('http://localhost:8080/proveedor/candy-jump/');
  await desktopPage.waitForLoadState('networkidle');
  const providerDesktopPath = 'v3-provider-no-photos-desktop.png';
  await desktopPage.screenshot({ path: providerDesktopPath, fullPage: false });
  copyFileSync(providerDesktopPath, `${storeDir}/${providerDesktopPath}`);
  console.log(`✓ Captured ${providerDesktopPath}`);
  console.log(`  Copied to ${storeDir}/${providerDesktopPath}`);
  
  await desktopContext.close();
  
  // Mobile screenshots (390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  const mobilePage = await mobileContext.newPage();
  
  // 3. Listing mobile (filters closed)
  await mobilePage.goto('http://localhost:8080/directorio/cordoba/cordoba/');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(500);
  const listingMobilePath = 'v3-listing-mobile.png';
  await mobilePage.screenshot({ path: listingMobilePath, fullPage: false });
  copyFileSync(listingMobilePath, `${storeDir}/${listingMobilePath}`);
  console.log(`✓ Captured ${listingMobilePath}`);
  console.log(`  Copied to ${storeDir}/${listingMobilePath}`);
  
  // 4. Listing mobile with filters open
  await mobilePage.click('.directory-filters-toggle');
  await mobilePage.waitForTimeout(300);
  const listingMobileFiltersPath = 'v3-listing-mobile-filters-open.png';
  await mobilePage.screenshot({ path: listingMobileFiltersPath, fullPage: false });
  copyFileSync(listingMobileFiltersPath, `${storeDir}/${listingMobileFiltersPath}`);
  console.log(`✓ Captured ${listingMobileFiltersPath}`);
  console.log(`  Copied to ${storeDir}/${listingMobileFiltersPath}`);
  
  // 5. Provider without photos mobile
  await mobilePage.goto('http://localhost:8080/proveedor/candy-jump/');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(500);
  const providerMobilePath = 'v3-provider-no-photos-mobile.png';
  await mobilePage.screenshot({ path: providerMobilePath, fullPage: false });
  copyFileSync(providerMobilePath, `${storeDir}/${providerMobilePath}`);
  console.log(`✓ Captured ${providerMobilePath}`);
  console.log(`  Copied to ${storeDir}/${providerMobilePath}`);
  
  await mobileContext.close();
  await browser.close();
  
  console.log('\n✅ All v3 screenshots captured and copied to Agent Store!');
}

takeScreenshots().catch(console.error);
