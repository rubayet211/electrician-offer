import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT_PATH = path.resolve(process.cwd(), "scripts/provision-client.mjs");

describe("Provisioning CLI (scripts/provision-client.mjs)", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "provision-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("creates client files with name and domain filled", () => {
    const res = spawnSync(
      process.execPath,
      [
        SCRIPT_PATH,
        "--root",
        tempDir,
        "--slug",
        "volt-masters",
        "--name",
        "Volt Masters Electric",
        "--domain",
        "voltmasters.com",
      ],
      { encoding: "utf-8" },
    );

    expect(res.status).toBe(0);

    const clientDir = path.join(tempDir, "clients", "volt-masters");
    expect(fs.existsSync(clientDir)).toBe(true);

    const configPath = path.join(clientDir, "client.config.ts");
    expect(fs.existsSync(configPath)).toBe(true);
    const configContent = fs.readFileSync(configPath, "utf-8");
    expect(configContent).toContain('"Volt Masters Electric"');
    expect(configContent).toContain('"voltmasters.com"');
    expect(configContent).toContain("__REQUIRED__");

    const envPath = path.join(clientDir, ".env.example");
    expect(fs.existsSync(envPath)).toBe(true);
    const envContent = fs.readFileSync(envPath, "utf-8");
    expect(envContent).toContain("sslmode=require");
    expect(envContent).toContain("RESEND_API_KEY");
    expect(envContent).toContain("IP_HASH_SECRET");
    expect(envContent).toContain("hash-admin-password.mjs");
    expect(envContent).toContain("randomBytes(32).toString('base64url')");

    const checklistPath = path.join(clientDir, "INTAKE_CHECKLIST.md");
    expect(fs.existsSync(checklistPath)).toBe(true);
  });

  it("refuses to overwrite an existing client directory without --force", () => {
    // Initial provision
    spawnSync(
      process.execPath,
      [
        SCRIPT_PATH,
        "--root",
        tempDir,
        "--slug",
        "current-electric",
        "--name",
        "Current Electric",
        "--domain",
        "currentelectric.com",
      ],
      { encoding: "utf-8" },
    );

    // Second provision without --force
    const res2 = spawnSync(
      process.execPath,
      [
        SCRIPT_PATH,
        "--root",
        tempDir,
        "--slug",
        "current-electric",
        "--name",
        "Current Electric 2",
        "--domain",
        "currentelectric2.com",
      ],
      { encoding: "utf-8" },
    );

    expect(res2.status).not.toBe(0);
    expect(res2.stderr).toContain("Directory already exists");
    expect(res2.stderr).toContain("--force");
  });

  it("overwrites an existing client directory when --force is provided", () => {
    // Initial provision
    spawnSync(
      process.execPath,
      [
        SCRIPT_PATH,
        "--root",
        tempDir,
        "--slug",
        "spark-pros",
        "--name",
        "Original Name",
        "--domain",
        "original.com",
      ],
      { encoding: "utf-8" },
    );

    // Overwrite with --force
    const res2 = spawnSync(
      process.execPath,
      [
        SCRIPT_PATH,
        "--root",
        tempDir,
        "--slug",
        "spark-pros",
        "--name",
        "Updated Spark Pros",
        "--domain",
        "updated-spark.com",
        "--force",
      ],
      { encoding: "utf-8" },
    );

    expect(res2.status).toBe(0);
    const configPath = path.join(tempDir, "clients", "spark-pros", "client.config.ts");
    const content = fs.readFileSync(configPath, "utf-8");
    expect(content).toContain('"Updated Spark Pros"');
    expect(content).toContain('"updated-spark.com"');
  });

  it("rejects invalid slugs containing spaces, uppercase letters, or special characters", () => {
    const invalidSlugs = ["Bad Slug", "UPPERCASE", "special@char", "slash/slug", "dot.slug"];

    for (const slug of invalidSlugs) {
      const res = spawnSync(
        process.execPath,
        [
          SCRIPT_PATH,
          "--root",
          tempDir,
          "--slug",
          slug,
          "--name",
          "Test Electric",
          "--domain",
          "test.com",
        ],
        { encoding: "utf-8" },
      );

      expect(res.status).not.toBe(0);
      expect(res.stderr).toContain("Invalid slug");
    }
  });

  it("activates a client by rewriting config/client.config.ts and printing the previous slug", () => {
    // Set up mock directory structure
    const clientDir = path.join(tempDir, "clients", "active-electric");
    fs.mkdirSync(clientDir, { recursive: true });
    fs.writeFileSync(
      path.join(clientDir, "client.config.ts"),
      "export default { mode: 'production' };\n",
    );

    const configDir = path.join(tempDir, "config");
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(
      path.join(configDir, "client.config.ts"),
      `import { clientConfigSchema } from "@/types/client-config";
import demo from "@/clients/demo/client.config";
export { default as clientConfig } from "@/clients/demo/client.config";
export const parsedClientConfig = clientConfigSchema.parse(demo);
`,
    );

    const res = spawnSync(
      process.execPath,
      [SCRIPT_PATH, "--root", tempDir, "--activate", "active-electric"],
      { encoding: "utf-8" },
    );

    expect(res.status).toBe(0);
    expect(res.stdout).toContain("Previous active client slug: demo");
    expect(res.stdout).toContain('Successfully activated client "active-electric"');

    const updatedConfig = fs.readFileSync(path.join(configDir, "client.config.ts"), "utf-8");
    expect(updatedConfig).toContain('from "@/clients/active-electric/client.config"');
  });
});
