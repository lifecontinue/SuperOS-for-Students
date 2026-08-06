const { chromium } = require("playwright-core");
const BASE = "http://127.0.0.1:8099";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const TARGETS = [
  "/demo/login.html",
  "/demo/index.html",
  "/demo/academic/achieve_goal.html",
  "/demo/interview/milestone0.html",
  "/demo/extracurricular/execution.html",
];

function fmt(v) { return v === "" ? "(empty)" : v; }

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

  for (const url of TARGETS) {
    try {
      await page.goto(BASE + url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1500);
      const r = await page.evaluate(() => {
        const out = {};
        const pick = (sel) => document.querySelector(sel);
        const cs = (el, pseudo) => el ? getComputedStyle(el, pseudo || null) : null;

        // body
        const body = cs(document.body);
        out.body_bg = body ? body.backgroundColor : "NO-BODY";

        // header
        const hdr = pick(".app-header") || pick(".header");
        const hc = cs(hdr);
        out.header_bg = hc ? hc.backgroundColor : "n/a";
        out.header_backdrop = hc ? hc.backdropFilter + "|" + hc.webkitBackdropFilter : "n/a";

        // any card-like element (first match)
        const card = pick('[class*="card"], [class*="Card"]');
        const cc = cs(card);
        out.card_class = card ? card.className : "none";
        out.card_radius = cc ? cc.borderRadius : "n/a";
        out.card_shadow = cc ? cc.boxShadow : "n/a";
        out.card_bg = cc ? cc.backgroundColor : "n/a";
        out.card_border = cc ? cc.borderTopWidth + " " + cc.borderTopStyle + " " + cc.borderTopColor : "n/a";

        // input placeholder color + dump ALL inputs
        const allInputs = [...document.querySelectorAll("input, textarea")];
        out.input_count = allInputs.length;
        out.inputs = allInputs.slice(0, 8).map(el => {
          const s = getComputedStyle(el);
          return {
            tag: el.tagName.toLowerCase(),
            cls: (el.className || "").toString().slice(0, 28),
            type: el.getAttribute("type") || "",
            bg: s.backgroundColor,
            radius: s.borderRadius,
            border: s.borderTopWidth + " " + s.borderTopStyle,
          };
        });
        const inp = pick("input, textarea, .onboarding-input");
        if (inp) {
          const ph = getComputedStyle(inp, "::placeholder");
          out.input_placeholder_color = ph ? ph.color : "n/a";
          out.input_bg = cs(inp).backgroundColor;
          out.input_radius = cs(inp).borderRadius;
        } else { out.input_placeholder_color = "no-input"; }

        // btn-primary
        const bp = pick(".btn-primary");
        if (bp) {
          const bpc = cs(bp);
          out.btn_primary_radius = bpc.borderRadius;
          out.btn_primary_border = bpc.borderTopWidth + " " + bpc.borderTopStyle + " " + bpc.borderTopColor;
          out.btn_primary_shadow = bpc.boxShadow;
          out.btn_primary_bg = bpc.backgroundColor;
        } else { out.btn_primary = "not-present"; }

        // btn-secondary
        const bs = pick(".btn-secondary");
        if (bs) {
          const bsc = cs(bs);
          out.btn_secondary_radius = bsc.borderRadius;
          out.btn_secondary_border = bsc.borderTopWidth + " " + bsc.borderTopStyle + " " + bsc.borderTopColor;
          out.btn_secondary_bg = bsc.backgroundColor;
        } else { out.btn_secondary = "not-present"; }

        return out;
      });
      console.log("\n=== " + url + " ===");
      for (const k of Object.keys(r)) console.log("  " + k + ": " + fmt(JSON.stringify(r[k])));
    } catch (e) {
      console.error("FAIL", url, e.message);
    }
  }
  await browser.close();
})();
