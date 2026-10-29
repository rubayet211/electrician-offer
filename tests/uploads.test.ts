import { expect, it } from "vitest";
import { validateUploads } from "@/lib/uploads/validate";
it("sniffs bytes and enforces count and size", async () => {
  const jpg = () => new File([new Uint8Array([255, 216, 255])], "a.jpg", { type: "image/jpeg" });
  const files = [jpg(), jpg(), jpg(), jpg(), new File(["fake"], "bad.jpg", { type: "image/png" })];
  const result = await validateUploads(files);
  expect(result.files).toHaveLength(3);
  expect(result.warnings).toHaveLength(2);
  const bad = await validateUploads([
    new File(["text"], "a.png", { type: "image/png" }),
    new File([new Uint8Array(4 * 1024 * 1024 + 1)], "big.jpg"),
  ]);
  expect(bad.files).toHaveLength(0);
  expect(bad.warnings).toHaveLength(2);
});
