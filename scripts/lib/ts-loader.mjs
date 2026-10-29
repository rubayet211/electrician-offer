import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(import.meta.url), "../../../");

function tryExtensions(filePath) {
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath;
  }
  const extensions = [".ts", ".tsx", ".js", ".mjs", "/index.ts", "/index.tsx", "/index.js"];
  for (const ext of extensions) {
    const candidate = filePath + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const relative = specifier.slice(2);
    const fullPath = path.join(projectRoot, relative);
    const resolved = tryExtensions(fullPath);
    if (resolved) {
      return nextResolve(pathToFileURL(resolved).href, context);
    }
  }

  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    const parentURL = context.parentURL;
    if (parentURL && parentURL.startsWith("file://")) {
      const parentDir = path.dirname(fileURLToPath(parentURL));
      const fullPath = path.resolve(parentDir, specifier);
      const resolved = tryExtensions(fullPath);
      if (resolved) {
        return nextResolve(pathToFileURL(resolved).href, context);
      }
    }
  }

  return nextResolve(specifier, context);
}
