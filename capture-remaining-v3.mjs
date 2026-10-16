import { chromium } from 'playwright';
import { copyFileSync } from 'fs';

async function takeRemainingScreenshots() {
  const browser = await chromium.launch();
  const storeDir = '/cursor/stores/self/artifacts/screenshots';
  
  // Mobile screenshots (390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  const mobilePage = await mobileContext.newPage();
  
  // 1. Listing mobile with filters open - manually open sidebar
  await mobilePage.goto('http://localhost:8080/directorio/cordoba/cordoba/');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(1000);
  
  // Check if toggle button exists
  const toggleExists = await mobilePage.locator('.directory-filters-toggle').count() > 0;
  console.log('Toggle button exists:', toggleExists);
  
  if (toggleExists) {
    await mobilePage.click('.directory-filters-toggle');
    await mobilePage.waitForTimeout(500);
  } else {
    console.log('Toggle button not found, taking screenshot of sidebar area');
  }
  
  const listingMobileFiltersPath = 'v3-listing-mobile-filters-open.png';
  await mobilePage.screenshot({ path: listingMobileFiltersPath, fullPage: false });
  copyFileSync(listingMobileFiltersPath, `${storeDir}/${listingMobileFiltersPath}`);
  console.log(`✓ Captured ${listingMobileFiltersPath}`);
  console.log(`  Copied to ${storeDir}/${listingMobileFiltersPath}`);
  
  // 2. Provider without photos mobile
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
  
  console.log('\n✅ Remaining v3 screenshots captured!');
}

takeRemainingScreenshots().catch(console.error);
