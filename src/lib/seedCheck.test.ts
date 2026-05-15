import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const SEED_PATH = path.resolve(__dirname, "../../prisma/seed.ts");
const EXPECTED_HOSTS = [
  "Rustoria",
  "Rustafied",
  "Reddit",
  "Facepunch Official",
  "Pickle",
  "Vital",
];

describe("seed.ts", () => {
  const source = readFileSync(SEED_PATH, "utf8");

  it.each(EXPECTED_HOSTS)("contains hoster %s", (name) => {
    expect(source).toContain(name);
  });

  it("references the deterministic dtstart", () => {
    expect(source).toContain("2026-01-01T19:00:00Z");
  });

  it("contains a monthly forced rule", () => {
    expect(source).toContain("FREQ=MONTHLY");
    expect(source).toContain("Monthly force wipe");
  });
});
