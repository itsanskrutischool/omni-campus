import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const BASE_URL = "https://demo.instikit.com";
const LOGIN_URL = `${BASE_URL}/app/login`;
const USERNAME = "admin";
const PASSWORD = "password";
const MASTER_FILE = path.resolve("OMNI_CAMPUS_ONE_FILE_MASTER.json");
const OUTPUT_FILE = path.resolve("instikit-live-admin-reception-capture.json");

function uniq(arr) {
  return [...new Set(arr)];
}

async function extractPageUi(page) {
  return page.evaluate(() => {
    const uniqLocal = (arr) => [...new Set(arr)];
    const txt = (s) =>
      Array.from(document.querySelectorAll(s))
        .map((el) => (el.textContent || "").trim())
        .filter(Boolean);
    const inputDetails = Array.from(document.querySelectorAll("input,textarea,select")).map((el) => ({
      tag: el.tagName.toLowerCase(),
      type: (el.getAttribute("type") || (el.tagName.toLowerCase() === "select" ? "select-one" : "")).toLowerCase(),
      name: el.getAttribute("name") || "",
      id: el.getAttribute("id") || "",
      placeholder: el.getAttribute("placeholder") || "",
      required: el.hasAttribute("required"),
      options:
        el.tagName.toLowerCase() === "select"
          ? Array.from(el.querySelectorAll("option"))
              .map((o) => (o.textContent || "").trim())
              .filter(Boolean)
              .slice(0, 50)
          : [],
    }));

    return {
      title: document.title,
      headings: uniqLocal(txt("h1,h2,h3,h4,h5,h6")).slice(0, 50),
      labels: uniqLocal(txt("label")).slice(0, 80),
      buttons: uniqLocal(txt("button,[role='button'],a.btn,.btn")).slice(0, 120),
      inputDetails,
      url: window.location.href,
      hasLoginWall: txt("h1,h2,h3").includes("Sign In"),
    };
  });
}

function summarizePages(results) {
  const headingSet = new Set();
  const labelSet = new Set();
  const buttonSet = new Set();
  const inputTypeCounts = {};
  let loginWallCount = 0;

  for (const r of results) {
    if (r.error) continue;
    if (r.hasLoginWall) loginWallCount += 1;
    (r.headings || []).forEach((x) => headingSet.add(x));
    (r.labels || []).forEach((x) => labelSet.add(x));
    (r.buttons || []).forEach((x) => buttonSet.add(x));
    (r.inputDetails || []).forEach((i) => {
      const key = i.type || i.tag || "unknown";
      inputTypeCounts[key] = (inputTypeCounts[key] || 0) + 1;
    });
  }

  return {
    uniqueHeadings: [...headingSet],
    uniqueLabels: [...labelSet],
    uniqueButtons: [...buttonSet],
    inputTypeCounts,
    loginWallCount,
  };
}

async function main() {
  const master = JSON.parse(fs.readFileSync(MASTER_FILE, "utf8"));
  const receptionPaths = uniq(
    (master.routes || [])
      .map((r) => r.fullPath || r.path)
      .filter((p) => typeof p === "string" && p.startsWith("/app/reception"))
  );

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.fill("input[name='email']", USERNAME);
  await page.fill("input[name='password']", PASSWORD);

  const signIn = page.getByRole("button", { name: "Sign In" }).first();
  await signIn.click();
  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});

  // Fallback if still on login page
  if (page.url().includes("/app/login")) {
    await page.goto(`${BASE_URL}/app/home`, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  }

  const adminHomeUi = await extractPageUi(page);

  const livePages = [];
  for (const route of receptionPaths) {
    const url = `${BASE_URL}${route}`;
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
      const ui = await extractPageUi(page);
      livePages.push({ route, ...ui });
    } catch (error) {
      livePages.push({ route, error: String(error) });
    }
  }

  const summary = summarizePages(livePages);
  const output = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    login: {
      loginUrl: LOGIN_URL,
      usernameUsed: USERNAME,
      successLikely: !adminHomeUi.hasLoginWall,
      finalUrlAfterLogin: adminHomeUi.url,
      homeTitle: adminHomeUi.title,
    },
    reception: {
      routeCount: receptionPaths.length,
      capturedCount: livePages.length,
      summary,
      pages: livePages,
    },
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf8");

  master.omniCampusFinalOneGo = master.omniCampusFinalOneGo || {};
  master.omniCampusFinalOneGo.liveAuthenticatedCapture = master.omniCampusFinalOneGo.liveAuthenticatedCapture || {};
  master.omniCampusFinalOneGo.liveAuthenticatedCapture.reception = output;
  fs.writeFileSync(MASTER_FILE, JSON.stringify(master, null, 2), "utf8");

  await browser.close();
  console.log(`Saved: ${OUTPUT_FILE}`);
  console.log(`Updated: ${MASTER_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
