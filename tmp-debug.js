const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4300/reportes');
  await page.evaluate(() => localStorage.setItem('rolUsuario', 'admin'));
  await page.reload();
  await page.waitForTimeout(2500);

  const offenders = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const all = document.querySelectorAll('*');
    const result = [];
    all.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > docWidth + 1 || rect.width > docWidth + 1) {
        result.push({
          tag: el.tagName,
          class: el.className && el.className.toString ? el.className.toString().slice(0, 80) : '',
          width: Math.round(rect.width),
          right: Math.round(rect.right),
          left: Math.round(rect.left)
        });
      }
    });
    return result.slice(0, 40);
  });

  console.log(JSON.stringify(offenders, null, 2));
  await browser.close();
})();
