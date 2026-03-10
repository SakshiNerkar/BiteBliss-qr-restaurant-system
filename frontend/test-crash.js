const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`[Browser Console Error] ${msg.text()}`);
        }
    });

    page.on('pageerror', error => {
        console.log(`[Page Error Window.onError] ${error.message}\n${error.stack}`);
    });

    try {
        await page.goto('http://localhost:5173/menu', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        console.log("Done waiting on /menu");
    } catch (e) {
        console.log("Playwright navigation error:", e);
    }

    await browser.close();
})();
