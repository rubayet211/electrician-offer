import { expect, it } from "vitest";
import { csvCell } from "@/lib/reporting/csv";
it("neutralizes spreadsheet formulas and quotes cells", () => {
  for (const text of ["=1+1", "+cmd", "-cmd", "@x", "\tcmd", "\rcmd"])
    expect(csvCell(text)).toBe(`"'${text}"`);
  expect(csvCell("+15550100142")).toBe('"+15550100142"');
  expect(csvCell("-123.45")).toBe('"-123.45"');
  expect(csvCell('a,"b"')).toBe('"a,""b"""');
});
