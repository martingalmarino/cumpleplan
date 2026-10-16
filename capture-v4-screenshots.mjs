import { chromium } from 'playwright';
import { copyFileSync } from 'fs';

async function captureV4Screenshots() {
  const browser = await chromium.launch();
  const storeDir = '/cursor/stores/self/artifacts/screenshots';
  const baseUrl = 'http://localhost:4321';
  
  // Desktop context (1440x1200)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 1200 }
  });
  const desktopPage = await desktopContext.newPage();
  
  // 1. Province page desktop (/directorio/cordoba/)
  await desktopPage.goto(`${baseUrl}/directorio/cordoba/`);
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(1500);
  await desktopPage.evaluate(() => window.scrollTo(0, 0));
  await desktopPage.waitForTimeout(300);
  const provinceDesktopPath = 'v4-province-desktop.png';
  await desktopPage.screenshot({ path: provinceDesktopPath, fullPage: false });
  copyFileSync(provinceDesktopPath, `${storeDir}/${provinceDesktopPath}`);
  console.log(`✓ ${provinceDesktopPath}`);
  
  // 2. Rubro page desktop (/directorio/cordoba/salones-infantiles/)
  await desktopPage.goto(`${baseUrl}/directorio/cordoba/salones-infantiles/`);
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(1500);
  await desktopPage.evaluate(() => window.scrollTo(0, 0));
  await desktopPage.waitForTimeout(300);
  const rubroDesktopPath = 'v4-rubro-desktop.png';
  await desktopPage.screenshot({ path: rubroDesktopPath, fullPage: false });
  copyFileSync(rubroDesktopPath, `${storeDir}/${rubroDesktopPath}`);
  console.log(`✓ ${rubroDesktopPath}`);
  
  await desktopContext.close();
  
  // Mobile context (390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const mobilePage = await mobileContext.newPage();
  
  // 3. Province page mobile
  await mobilePage.goto(`${baseUrl}/directorio/cordoba/`);
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(1500);
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(300);
  const provinceMobilePath = 'v4-province-mobile.png';
  await mobilePage.screenshot({ path: provinceMobilePath, fullPage: false });
  copyFileSync(provinceMobilePath, `${storeDir}/${provinceMobilePath}`);
  console.log(`✓ ${provinceMobilePath}`);
  
  // 4. Rubro page mobile
  await mobilePage.goto(`${baseUrl}/directorio/cordoba/salones-infantiles/`);
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(1500);
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(300);
  const rubroMobilePath = 'v4-rubro-mobile.png';
  await mobilePage.screenshot({ path: rubroMobilePath, fullPage: false });
  copyFileSync(rubroMobilePath, `${storeDir}/${rubroMobilePath}`);
  console.log(`✓ ${rubroMobilePath}`);
  
  await mobileContext.close();
  await browser.close();
  
  console.log(`\n✅ All v4 screenshots saved to:\n   ${storeDir}/`);
}

captureV4Screenshots().catch(console.error);
