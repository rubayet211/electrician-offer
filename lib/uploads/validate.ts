import { parsedClientConfig } from "@/config/client.config";
export type ValidatedUpload = { name: string; contentType: string; data: Uint8Array };
export async function validateUploads(
  files: File[],
): Promise<{ files: ValidatedUpload[]; warnings: string[] }> {
  const valid: ValidatedUpload[] = [],
    warnings: string[] = [];
  const config = parsedClientConfig.uploads;
  for (const [index, file] of files.entries()) {
    if (!config.enabled || index >= config.maxFiles || file.size > config.maxBytesPerFile) {
      warnings.push(`Photo ${index + 1} was not accepted.`);
      continue;
    }
    const data = new Uint8Array(await file.arrayBuffer());
    const jpeg = data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
    const png = [137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => data[i] === byte);
    const webp =
      data.length >= 12 &&
      String.fromCharCode(...data.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...data.slice(8, 12)) === "WEBP";
    const contentType = jpeg ? "image/jpeg" : png ? "image/png" : webp ? "image/webp" : null;
    if (!contentType) {
      warnings.push(`Photo ${index + 1} was not accepted.`);
      continue;
    }
    const name = file.name.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 80);
    valid.push({
      name: name && /[A-Za-z0-9]/.test(name) ? name : `photo-${index + 1}`,
      contentType,
      data,
    });
  }
  return { files: valid, warnings };
}
