import { chromium } from 'playwright';
import { copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

async function takeV3Screenshots() {
  const browser = await chromium.launch();
  const storeDir = '/cursor/stores/self/artifacts/screenshots';
  const distPath = resolve('/workspace/dist');
  
  // Desktop context (1440x1200)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 1200 }
  });
  const desktopPage = await desktopContext.newPage();
  
  // 1. Listing desktop
  const listingPath = `file://${distPath}/directorio/cordoba/cordoba/index.html`;
  await desktopPage.goto(listingPath);
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(1000);
  const listingDesktopPath = 'v3-listing-desktop.png';
  await desktopPage.screenshot({ path: listingDesktopPath, fullPage: false });
  copyFileSync(listingDesktopPath, `${storeDir}/${listingDesktopPath}`);
  console.log(`✓ Captured ${listingDesktopPath}`);
  
  // 2. Provider without photos desktop
  await desktopPage.setViewportSize({ width: 1440, height: 900 });
  const providerPath = `file://${distPath}/proveedor/candy-jump/index.html`;
  await desktopPage.goto(providerPath);
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(1000);
  const providerDesktopPath = 'v3-provider-no-photos-desktop.png';
  await desktopPage.screenshot({ path: providerDesktopPath, fullPage: false });
  copyFileSync(providerDesktopPath, `${storeDir}/${providerDesktopPath}`);
  console.log(`✓ Captured ${providerDesktopPath}`);
  
  await desktopContext.close();
  
  // Mobile context (390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const mobilePage = await mobileContext.newPage();
  
  // 3. Listing mobile
  await mobilePage.goto(listingPath);
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(1000);
  const listingMobilePath = 'v3-listing-mobile.png';
  await mobilePage.screenshot({ path: listingMobilePath, fullPage: false });
  copyFileSync(listingMobilePath, `${storeDir}/${listingMobilePath}`);
  console.log(`✓ Captured ${listingMobilePath}`);
  
  // 4. Listing mobile - scroll to show filters button
  await mobilePage.evaluate(() => window.scrollTo(0, 300));
  await mobilePage.waitForTimeout(300);
  const listingMobileFiltersPath = 'v3-listing-mobile-filters-open.png';
  await mobilePage.screenshot({ path: listingMobileFiltersPath, fullPage: false });
  copyFileSync(listingMobileFiltersPath, `${storeDir}/${listingMobileFiltersPath}`);
  console.log(`✓ Captured ${listingMobileFiltersPath}`);
  
  // 5. Provider mobile
  await mobilePage.goto(providerPath);
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(1000);
  const providerMobilePath = 'v3-provider-no-photos-mobile.png';
  await mobilePage.screenshot({ path: providerMobilePath, fullPage: false });
  copyFileSync(providerMobilePath, `${storeDir}/${providerMobilePath}`);
  console.log(`✓ Captured ${providerMobilePath}`);
  
  await mobileContext.close();
  await browser.close();
  
  console.log('\n✅ All v3 screenshots captured and saved to Agent Store!');
  console.log(`   ${storeDir}/`);
}

takeV3Screenshots().catch(console.error);
