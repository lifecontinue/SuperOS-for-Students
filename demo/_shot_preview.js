const { chromium } = require("playwright-core");
const BASE = "http://127.0.0.1:8099";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const shots = [
    ["/demo/login.html", "preview-app.png"],
    ["/demo/index.html", "preview-doc.png"],
    ["/demo/academic/achieve_goal.html", "preview-sub.png"],
  ];
  for (const [url, name] of shots) {
    try {
      await page.goto(BASE + url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(2500); // 等字体/JS 渲染
      await page.screenshot({ path: "demo/_preview/" + name, fullPage: false });
      console.log("OK", name, url);
    } catch (e) {
      console.error("FAIL", name, url, e.message);
    }
  }
  await browser.close();
})();
