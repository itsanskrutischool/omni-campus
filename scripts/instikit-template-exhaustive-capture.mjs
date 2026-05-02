import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const BASE_URL = "https://demo.instikit.com";
const LOGIN_URL = `${BASE_URL}/app/login`;
const MASTER_FILE = path.resolve("OMNI_CAMPUS_ONE_FILE_MASTER.json");
const OUTPUT_FILE = path.resolve("instikit-template-exhaustive-capture.json");
const ROLE_FILTER = process.env.ROLE_FILTER
  ? process.env.ROLE_FILTER.split(",").map((x) => x.trim()).filter(Boolean)
  : null;
const ROUTE_LIMIT = process.env.ROUTE_LIMIT ? Number(process.env.ROUTE_LIMIT) : null;
const MODULE_PREFIX = process.env.MODULE_PREFIX ? process.env.MODULE_PREFIX.trim() : null;
const ROLE_BUTTON = {
  Admin: "Login as Admin",
  Staff: "Login as Staff",
  Student: "Login as Student",
  Guardian: "Login as Guardian",
};
const KEYWORDS = [
  "mark",
  "sheet",
  "result",
  "exam",
  "receipt",
  "fee",
  "invoice",
  "payment",
  "print",
  "pdf",
  "certificate",
  "id-card",
  "idcard",
  "admit",
  "hall",
  "transfer",
  "tc",
  "payroll",
  "salary",
  "report",
  "ledger",
  "voucher",
  "slip",
  "template",
];

function uniq(arr) {
  return [...new Set(arr)];
}

function extractCandidateRoutes(master) {
  const routes = (master.routes || [])
    .map((r) => r.fullPath || r.path)
    .filter((r) => typeof r === "string" && r.startsWith("/app/"));
  let out = uniq(
    routes.filter((route) => {
      const low = route.toLowerCase();
      return KEYWORDS.some((k) => low.includes(k));
    })
  );
  if (MODULE_PREFIX) {
    out = out.filter((r) => r.startsWith(`/app/${MODULE_PREFIX}`));
  }
  if (ROUTE_LIMIT && Number.isFinite(ROUTE_LIMIT) && ROUTE_LIMIT > 0) {
    out = out.slice(0, ROUTE_LIMIT);
  }
  return out;
}

function buildUuidPool(master) {
  const map = master.phase2?.slugUuidMap || {};
  const values = Object.values(map).flat().filter(Boolean);
  return uniq(values);
}

function resolveRoute(route, uuidPool) {
  let out = route;
  if (out.includes(":uuid")) out = out.replace(/:uuid/g, uuidPool[0] || "00000000-0000-0000-0000-000000000000");
  if (out.includes(":slug")) out = out.replace(/:slug/g, "sample-slug");
  if (out.includes(":token")) out = out.replace(/:token/g, "sample-token");
  if (out.includes(":module")) out = out.replace(/:module/g, "student");
  return out;
}

async function extractPage(page) {
  const data = await page.evaluate(() => {
    const textList = (sel) =>
      Array.from(document.querySelectorAll(sel))
        .map((el) => (el.textContent || "").trim())
        .filter(Boolean);
    const headings = [...new Set(textList("h1,h2,h3,h4,h5,h6"))].slice(0, 30);
    const labels = [...new Set(textList("label"))].slice(0, 80);
    const buttons = [...new Set(textList("button,[role='button'],a.btn,.btn"))].slice(0, 120);
    const inputs = Array.from(document.querySelectorAll("input,textarea,select")).map((el) => ({
      tag: el.tagName.toLowerCase(),
      type: (el.getAttribute("type") || (el.tagName.toLowerCase() === "select" ? "select-one" : "")).toLowerCase(),
      name: el.getAttribute("name") || "",
      id: el.getAttribute("id") || "",
      placeholder: el.getAttribute("placeholder") || "",
      options:
        el.tagName.toLowerCase() === "select"
          ? Array.from(el.querySelectorAll("option"))
              .map((o) => (o.textContent || "").trim())
              .filter(Boolean)
              .slice(0, 80)
          : [],
    }));
    return {
      title: document.title,
      url: window.location.href,
      headings,
      labels,
      buttons,
      inputs,
      hasSignIn: headings.includes("Sign In"),
    };
  });
  return data;
}

async function loginAsRole(page, role) {
  await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  const btnName = ROLE_BUTTON[role];
  const btn = page.getByRole("button", { name: btnName }).first();
  await btn.click();
  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
  if (page.url().includes("/app/login")) {
    // fallback direct sign in with admin for stubborn role buttons
    if (role === "Admin") {
      await page.fill("input[name='email']", "admin");
      await page.fill("input[name='password']", "password");
      await page.getByRole("button", { name: "Sign In" }).first().click();
      await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
    }
  }
}

async function crawlRole(role, routes, uuidPool) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const roleResults = [];
  const apiSeen = new Set();

  page.on("requestfinished", (req) => {
    const url = req.url();
    if (url.includes("/api/")) apiSeen.add(url);
  });

  await loginAsRole(page, role);
  const postLoginUrl = page.url();

  for (const route of routes) {
    const resolved = resolveRoute(route, uuidPool);
    const full = `${BASE_URL}${resolved}`;
    try {
      await page.goto(full, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("networkidle", { timeout: 3000 }).catch(() => {});
      const ui = await extractPage(page);
      roleResults.push({
        route,
        resolvedRoute: resolved,
        ...ui,
      });
    } catch (error) {
      roleResults.push({
        route,
        resolvedRoute: resolved,
        error: String(error),
      });
    }
    if (roleResults.length % 25 === 0) {
      console.log(`[${role}] captured ${roleResults.length}/${routes.length}`);
    }
  }

  await browser.close();
  return {
    role,
    postLoginUrl,
    routeCount: routes.length,
    apiSeen: [...apiSeen].slice(0, 2000),
    pages: roleResults,
  };
}

function summarizeRole(roleData) {
  const pages = roleData.pages || [];
  let loginWall = 0;
  let errors = 0;
  const headings = new Set();
  const labels = new Set();
  const buttons = new Set();
  const inputTypeCounts = {};

  for (const p of pages) {
    if (p.error) {
      errors += 1;
      continue;
    }
    if (p.hasSignIn) loginWall += 1;
    (p.headings || []).forEach((x) => headings.add(x));
    (p.labels || []).forEach((x) => labels.add(x));
    (p.buttons || []).forEach((x) => buttons.add(x));
    (p.inputs || []).forEach((i) => {
      const t = i.type || i.tag || "unknown";
      inputTypeCounts[t] = (inputTypeCounts[t] || 0) + 1;
    });
  }

  return {
    role: roleData.role,
    routeCount: roleData.routeCount,
    errors,
    loginWallCount: loginWall,
    uniqueHeadingsCount: headings.size,
    uniqueLabelsCount: labels.size,
    uniqueButtonsCount: buttons.size,
    inputTypeCounts,
  };
}

async function main() {
  const master = JSON.parse(fs.readFileSync(MASTER_FILE, "utf8"));
  const candidateRoutes = extractCandidateRoutes(master);
  const uuidPool = buildUuidPool(master);
  const roles = ROLE_FILTER && ROLE_FILTER.length ? ROLE_FILTER : ["Admin", "Staff", "Student", "Guardian"];
  const roleOutputs = [];

  for (const role of roles) {
    const output = await crawlRole(role, candidateRoutes, uuidPool);
    roleOutputs.push(output);
  }

  const summary = roleOutputs.map(summarizeRole);
  const payload = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    candidateRouteCount: candidateRoutes.length,
    roles,
    summary,
    data: roleOutputs,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2), "utf8");

  master.omniCampusFinalOneGo = master.omniCampusFinalOneGo || {};
  master.omniCampusFinalOneGo.templateExtraction = master.omniCampusFinalOneGo.templateExtraction || {};
  master.omniCampusFinalOneGo.templateExtraction.exhaustiveRun = payload;
  master.omniCampusFinalOneGo.templateExtraction.lastRunConfig = {
    roles,
    routeLimit: ROUTE_LIMIT,
    modulePrefix: MODULE_PREFIX,
  };
  master.omniCampusFinalOneGo.templateExtraction.exhaustiveRunNotes = [
    "This run targets template-related routes discovered via keyword filtering from full route inventory.",
    "Routes with unresolved dynamic params are best-effort resolved using known UUID pools.",
    "Any page still showing Sign In under a role indicates role access or auth-wall limitations for that route.",
  ];
  fs.writeFileSync(MASTER_FILE, JSON.stringify(master, null, 2), "utf8");

  console.log(`Saved: ${OUTPUT_FILE}`);
  console.log(`Updated: ${MASTER_FILE}`);
  console.log(`Candidate routes: ${candidateRoutes.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
