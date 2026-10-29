#!/usr/bin/env node
import { register } from "node:module";
import path from "node:path";
import {
  parseEnvFile,
  validateStaticConfig,
  crawlAndValidateUrl,
  printSummaryTable,
} from "./lib/prelaunch.mjs";

// Register TypeScript loader to resolve "@/..." aliases and TS files in Node
register("./lib/ts-loader.mjs", import.meta.url);

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        options[key] = next;
        i++;
      } else {
        options[key] = true;
      }
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();

  // Load config & env via the registered TS loader
  const { assertProductionReady } = await import("../lib/config/env.ts");
  const { parsedClientConfig } = await import("../config/client.config.ts");
  const { default: demoConfig } = await import("../clients/demo/client.config.ts");

  let env = { ...process.env };
  if (options["env-file"]) {
    const envFilePath = path.resolve(process.cwd(), options["env-file"]);
    try {
      const parsedEnv = parseEnvFile(envFilePath);
      env = { ...env, ...parsedEnv };
      console.log(`Loaded environment from ${envFilePath}`);
    } catch (err) {
      console.error(`[ERROR] Failed to load env file: ${err.message}`);
      process.exit(1);
    }
  }

  console.log(`\n======================================================`);
  console.log(`   AXINOFY PRELAUNCH VALIDATION`);
  console.log(`======================================================`);
  console.log(`Client: ${parsedClientConfig.business?.name || "Unknown"}`);
  console.log(`Mode:   ${parsedClientConfig.mode}`);
  console.log(`Domain: ${parsedClientConfig.business?.domain}\n`);

  // Static checks
  const staticResult = validateStaticConfig(parsedClientConfig, env, {
    assertProductionReady,
    demoConfig,
    expectNoindex: Boolean(options["expect-noindex"]),
    onWarning: (msg) => console.warn(`[WARNING] ${msg}`),
  });

  if (!staticResult.valid) {
    console.error(
      `[FAILURE] Static configuration checks failed with ${staticResult.problems.length} errors:`,
    );
    for (const p of staticResult.problems) {
      console.error(`  - ${p}`);
    }
    process.exit(1);
  }

  console.log(`[PASS] Static configuration checks passed.`);

  // URL checks
  if (options.url) {
    const targetUrl = String(options.url).trim();
    console.log(`\nBeginning live verification of ${targetUrl}...`);

    const crawlResult = await crawlAndValidateUrl(targetUrl, {
      expectNoindex: Boolean(options["expect-noindex"]),
      config: parsedClientConfig,
    });
    printSummaryTable(crawlResult.results);

    if (!crawlResult.passed) {
      console.error(`[FAILURE] Live site crawl failed with ${crawlResult.problems.length} errors:`);
      for (const p of crawlResult.problems) {
        console.error(`  - ${p}`);
      }
      process.exit(1);
    }

    console.log(`[PASS] All live crawl checks passed successfully.`);
  }

  console.log(`\n======================================================`);
  console.log(`PRELAUNCH VERIFICATION COMPLETED SUCCESSFULLY`);
  console.log(`======================================================\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`[FATAL] Prelaunch check error:`, err);
  process.exit(1);
});
