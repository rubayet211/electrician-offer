import fs from "node:fs";
import { isDeepStrictEqual } from "node:util";

export function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Env file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  /** @type {Record<string, string>} */
  const env = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();

    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    env[key] = val;
  }

  return env;
}

/**
 * @param {any} config
 * @param {Record<string, string | undefined>} [env]
 * @param {any} [options]
 */
export function validateStaticConfig(config, env = process.env, options = {}) {
  const problems = [];
  const warnings = [];

  const emitWarning = (msg) => {
    warnings.push(msg);
    if (options.onWarning) options.onWarning(msg);
  };

  if (!config || typeof config !== "object") {
    return { valid: false, problems: ["Config is not an object"], warnings };
  }

  // 1. Check for __REQUIRED__ placeholders
  if (JSON.stringify(config).includes("__REQUIRED__")) {
    problems.push("Active config contains __REQUIRED__ placeholders");
  }

  for (const field of ["hours", "branding", "positioning"]) {
    if (options.demoConfig && isDeepStrictEqual(config[field], options.demoConfig[field]))
      problems.push(`${field} must not match the demo config`);
  }

  // 2. Mode must be production
  if (config.mode !== "production" && !(options.expectNoindex && config.mode === "staging")) {
    problems.push(`Mode must be production, found "${config.mode}"`);
  }

  if (env.NEXT_PUBLIC_SITE_ENV !== "production" && !options.expectNoindex) {
    problems.push("NEXT_PUBLIC_SITE_ENV must be production");
  }

  // 3. Phone must be E.164
  const phone = config.business?.phone;
  if (!phone || !/^\+[1-9]\d{6,14}$/.test(phone)) {
    problems.push(`Business phone "${phone}" is not in valid E.164 format (+1XXXXXXXXXX)`);
  }

  // 4. Domain must be bare host
  const domain = config.business?.domain;
  if (
    !domain ||
    /^https?:\/\//i.test(domain) ||
    domain.includes("/") ||
    !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(domain)
  ) {
    problems.push(
      `Business domain "${domain}" must be a bare hostname (no protocol or trailing slash)`,
    );
  }

  // 5. Recipients set and not example.com
  const recipients = config.notifications?.recipients;
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    problems.push("Notification recipients must contain at least one email address");
  } else {
    for (const email of recipients) {
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        /@(?:[^@]*\.)?(?:example\.com|test|invalid)$/i.test(email)
      ) {
        problems.push(`Notification recipient "${email}" must be a valid non-example address`);
      }
    }
  }

  // 6. License verification: >= 1 verified license OR explicitly empty with warning
  const licenses = config.credentials?.licenses;
  if (!licenses || !Array.isArray(licenses) || licenses.length === 0) {
    emitWarning("No licenses configured in credentials. Explicitly empty credentials.");
  } else {
    const verifiedLicenses = licenses.filter((lic) => lic.status === "verified" && !lic.isSample);
    if (verifiedLicenses.length === 0) {
      problems.push(
        "Credentials contains licenses, but none are verified. At least 1 verified license is required (or licenses array must be explicitly empty).",
      );
    }
  }

  // 7. Services offered >= 1
  const offeredServices = (config.services || []).filter((s) => s.offered);
  if (offeredServices.length < 1) {
    problems.push("At least one service must be marked as offered");
  }

  // 8. Pages enabled <= 8
  const enabledPages = (config.pages || []).filter((p) => p.enabled);
  if (enabledPages.length > 8) {
    problems.push(`At most 8 pages may be enabled, found ${enabledPages.length}`);
  }

  // 9. Env completeness via assertProductionReady if available
  if (options.assertProductionReady) {
    const envProblems = options.assertProductionReady(config, env);
    if (Array.isArray(envProblems)) {
      for (const ep of envProblems) {
        if (!problems.includes(ep)) {
          problems.push(ep);
        }
      }
    }
  }

  return {
    valid: problems.length === 0,
    problems,
    warnings,
  };
}

export async function crawlAndValidateUrl(baseUrl, options = {}) {
  const problems = [];
  const results = [];

  if (!baseUrl.startsWith("https://")) {
    problems.push(`Base URL must use HTTPS: ${baseUrl}`);
    return { passed: false, results, problems };
  }

  // 1. Fetch robots.txt
  const robotsUrl = new URL("/robots.txt", baseUrl).toString();
  try {
    const res = await fetch(robotsUrl);
    if (res.status !== 200) {
      problems.push(`robots.txt returned HTTP ${res.status}`);
    } else {
      const robotsText = await res.text();
      if (
        options.expectNoindex &&
        (!/Disallow:\s*\/\s*$/m.test(robotsText) || /Allow:\s*\/\s*$/m.test(robotsText))
      ) {
        problems.push("robots.txt must disallow root in staging");
      }
      if (
        !options.expectNoindex &&
        /Disallow:\s*\/\s*$/m.test(robotsText) &&
        !/Allow:\s*\/\s*$/m.test(robotsText)
      ) {
        problems.push(`robots.txt disallows root in production: \n${robotsText}`);
      }
    }
  } catch (err) {
    problems.push(`Failed to fetch robots.txt: ${err.message}`);
  }

  // 2. Fetch sitemap.xml
  const sitemapUrl = new URL("/sitemap.xml", baseUrl).toString();
  const urlsToCrawl = new Set([new URL("/", baseUrl).toString()]);

  if (options.expectNoindex) {
    for (const page of options.config?.pages ?? []) {
      if (page.enabled)
        urlsToCrawl.add(new URL(page.slug === "home" ? "/" : `/${page.slug}`, baseUrl).toString());
    }
    for (const service of options.config?.services ?? []) {
      if (service.offered)
        urlsToCrawl.add(new URL(`/services/${service.slug}`, baseUrl).toString());
    }
  } else
    try {
      const res = await fetch(sitemapUrl);
      if (res.status !== 200) {
        problems.push(`sitemap.xml returned HTTP ${res.status}`);
      } else {
        const sitemapXml = await res.text();
        const locMatches = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)];
        if (locMatches.length === 0) {
          problems.push("sitemap.xml contains no <loc> entries");
        }
        for (const m of locMatches) {
          const loc = new URL(m[1].trim());
          const target = new URL(baseUrl);
          target.pathname = loc.pathname;
          target.search = loc.search;
          target.hash = "";
          urlsToCrawl.add(target.toString());
        }
      }
    } catch (err) {
      problems.push(`Failed to fetch sitemap.xml: ${err.message}`);
    }

  // 3. Crawl each page
  const seenTitles = new Map();

  for (const pageUrl of urlsToCrawl) {
    const pageResult = {
      url: pageUrl,
      status: 0,
      title: "",
      hasDescription: false,
      canonical: "",
      h1Count: 0,
      hasTel: false,
      jsonLdValid: false,
      hasNoindex: false,
      errors: [],
    };

    try {
      const res = await fetch(pageUrl);
      pageResult.status = res.status;

      if (res.status !== 200) {
        pageResult.errors.push(`HTTP ${res.status}`);
      }

      if (!pageUrl.startsWith("https://")) {
        pageResult.errors.push("URL is not HTTPS");
      }

      const html = await res.text();

      // Title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : "";
      pageResult.title = title;
      if (!title) {
        pageResult.errors.push("Missing <title>");
      } else {
        if (seenTitles.has(title)) {
          pageResult.errors.push(`Duplicate title shared with ${seenTitles.get(title)}`);
        } else {
          seenTitles.set(title, pageUrl);
        }
      }

      // Meta description
      const descMatch = html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
      );
      if (descMatch && descMatch[1].trim()) {
        pageResult.hasDescription = true;
      } else {
        pageResult.errors.push("Missing meta description");
      }

      // Canonical
      const canonicalMatch = html.match(
        /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i,
      );
      if (canonicalMatch && canonicalMatch[1].trim()) {
        const canUrl = canonicalMatch[1].trim();
        pageResult.canonical = canUrl;
        if (!canUrl.startsWith("https://")) {
          pageResult.errors.push(`Canonical URL "${canUrl}" is not absolute HTTPS`);
        }
      } else {
        pageResult.errors.push("Missing canonical link");
      }

      // Exactly one <h1>
      const h1Matches = html.match(/<h1[\s>]/gi) || [];
      pageResult.h1Count = h1Matches.length;
      if (h1Matches.length !== 1) {
        pageResult.errors.push(`Expected exactly 1 <h1>, found ${h1Matches.length}`);
      }

      // At least one tel: link
      const hasTel = /href=["']tel:[^"']+["']/i.test(html);
      pageResult.hasTel = hasTel;
      if (!hasTel) {
        pageResult.errors.push("No tel: link found");
      }

      // JSON-LD parses
      const jsonLdBlocks = [
        ...html.matchAll(
          /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
        ),
      ];
      if (jsonLdBlocks.length === 0) {
        pageResult.errors.push("No JSON-LD script found");
      } else {
        let allValid = true;
        for (const block of jsonLdBlocks) {
          try {
            JSON.parse(block[1]);
          } catch (e) {
            allValid = false;
            pageResult.errors.push(`Invalid JSON-LD syntax: ${e.message}`);
          }
        }
        pageResult.jsonLdValid = allValid;
      }

      // No noindex in production
      const robotsMeta = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
      if (robotsMeta && /noindex/i.test(robotsMeta[1])) {
        pageResult.hasNoindex = true;
        if (!options.expectNoindex)
          pageResult.errors.push(`Page has noindex meta tag: "${robotsMeta[1]}"`);
      }
      if (options.expectNoindex && !pageResult.hasNoindex)
        pageResult.errors.push("Page lacks noindex meta tag");
    } catch (err) {
      pageResult.errors.push(`Fetch failed: ${err.message}`);
    }

    results.push(pageResult);
    if (pageResult.errors.length > 0) {
      problems.push(`${pageUrl}: ${pageResult.errors.join(", ")}`);
    }
  }

  return {
    passed: problems.length === 0,
    results,
    problems,
  };
}

export function printSummaryTable(results) {
  console.log(
    "\n=========================================================================================",
  );
  console.log("PRELAUNCH LIVE URL VALIDATION SUMMARY");
  console.log(
    "=========================================================================================",
  );
  console.log(
    "URL".padEnd(35) +
      "Status".padEnd(8) +
      "H1".padEnd(5) +
      "Tel".padEnd(6) +
      "Desc".padEnd(6) +
      "Canon".padEnd(8) +
      "JSON-LD".padEnd(10) +
      "Robots",
  );
  console.log(
    "-----------------------------------------------------------------------------------------",
  );

  for (const r of results) {
    const urlStr = r.url.length > 33 ? r.url.slice(0, 30) + "..." : r.url;
    const statusStr = String(r.status);
    const h1Str = String(r.h1Count);
    const telStr = r.hasTel ? "YES" : "NO";
    const descStr = r.hasDescription ? "YES" : "NO";
    const canonStr = r.canonical ? "YES" : "NO";
    const jsonLdStr = r.jsonLdValid ? "VALID" : "INVALID";
    const robotsStr = r.hasNoindex ? "NOINDEX" : "ALLOW";

    console.log(
      urlStr.padEnd(35) +
        statusStr.padEnd(8) +
        h1Str.padEnd(5) +
        telStr.padEnd(6) +
        descStr.padEnd(6) +
        canonStr.padEnd(8) +
        jsonLdStr.padEnd(10) +
        robotsStr,
    );
  }
  console.log(
    "=========================================================================================\n",
  );
}
