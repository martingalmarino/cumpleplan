import { chromium } from 'playwright';

async function takeScreenshots() {
  const browser = await chromium.launch();
  
  // Desktop screenshots (1440x900)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const desktopPage = await desktopContext.newPage();
  
  // 1. Listing desktop - with green header band visible
  await desktopPage.goto('http://localhost:4321/directorio/cordoba/cordoba/');
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.evaluate(() => window.scrollTo(0, 0));
  await desktopPage.waitForTimeout(500);
  // Take a taller screenshot to show the green header and some cards
  await desktopPage.setViewportSize({ width: 1440, height: 1200 });
  await desktopPage.screenshot({ path: 'approved-listing-desktop.png', fullPage: false });
  console.log('✓ Captured listing desktop');
  
  // Reset viewport
  await desktopPage.setViewportSize({ width: 1440, height: 900 });
  
  // 2. Provider without photos desktop
  await desktopPage.goto('http://localhost:4321/proveedor/candy-jump/');
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.screenshot({ path: 'approved-provider-no-photos-desktop.png', fullPage: false });
  console.log('✓ Captured provider desktop');
  
  await desktopContext.close();
  
  // Mobile screenshots (390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const mobilePage = await mobileContext.newPage();
  
  // 3. Listing mobile
  await mobilePage.goto('http://localhost:4321/directorio/cordoba/cordoba/');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: 'approved-listing-mobile.png', fullPage: false });
  console.log('✓ Captured listing mobile');
  
  // 4. Provider without photos mobile
  await mobilePage.goto('http://localhost:4321/proveedor/candy-jump/');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.screenshot({ path: 'approved-provider-no-photos-mobile.png', fullPage: false });
  console.log('✓ Captured provider mobile');
  
  await mobileContext.close();
  await browser.close();
  
  console.log('\n✓ All screenshots captured successfully!');
}

takeScreenshots().catch(console.error);
