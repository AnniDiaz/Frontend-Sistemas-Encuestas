const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();

  // Desktop
  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopCtx.newPage();
  await desktopPage.goto('http://localhost:4300/reportes');
  await desktopPage.evaluate(() => localStorage.setItem('rolUsuario', 'admin'));
  await desktopPage.reload();
  await desktopPage.waitForTimeout(2500);
  await desktopPage.screenshot({ path: 'tmp-screenshots/desktop-1440.png', fullPage: true });

  // Mobile
  const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mobilePage = await mobileCtx.newPage();
  mobilePage.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()); });
  await mobilePage.goto('http://localhost:4300/reportes');
  await mobilePage.evaluate(() => localStorage.setItem('rolUsuario', 'admin'));
  await mobilePage.reload();
  await mobilePage.waitForTimeout(2500);

  const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await mobilePage.evaluate(() => document.documentElement.clientWidth);
  console.log('MOBILE scrollWidth:', scrollWidth, 'clientWidth:', clientWidth, 'overflow:', scrollWidth > clientWidth);

  await mobilePage.screenshot({ path: 'tmp-screenshots/mobile-375-viewport.png' });
  await mobilePage.screenshot({ path: 'tmp-screenshots/mobile-375-full.png', fullPage: true });

  // Small phone
  const smallCtx = await browser.newContext({ viewport: { width: 320, height: 568 } });
  const smallPage = await smallCtx.newPage();
  await smallPage.goto('http://localhost:4300/reportes');
  await smallPage.evaluate(() => localStorage.setItem('rolUsuario', 'admin'));
  await smallPage.reload();
  await smallPage.waitForTimeout(2500);
  const sw2 = await smallPage.evaluate(() => document.documentElement.scrollWidth);
  const cw2 = await smallPage.evaluate(() => document.documentElement.clientWidth);
  console.log('SMALL(320) scrollWidth:', sw2, 'clientWidth:', cw2, 'overflow:', sw2 > cw2);
  await smallPage.screenshot({ path: 'tmp-screenshots/mobile-320-full.png', fullPage: true });

  await browser.close();
})();
