import { expect, it } from "vitest";
import { csvCell } from "@/lib/reporting/csv";
it("neutralizes spreadsheet formulas and quotes cells", () => {
  for (const text of ["=1+1", "+1", "-1", "@x", "\tcmd", "\rcmd"])
    expect(csvCell(text)).toBe(`"'${text}"`);
  expect(csvCell('a,"b"')).toBe('"a,""b"""');
});
