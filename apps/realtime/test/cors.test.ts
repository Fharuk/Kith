import { describe, expect, it } from "vitest";
import { createOriginChecker } from "../src/cors";

/**
 * The websocket origin allowlist is a security boundary: too loose and any site can drive our
 * auction plane, too tight and the product silently stops updating.
 */
function allows(origin: string | undefined, allowed = ["https://kith.ng"]) {
  let result: boolean | null = null;
  createOriginChecker(allowed)(origin, (_err, allow) => { result = allow; });
  return result;
}

describe("socket.io origin allowlist", () => {
  it("allows configured production origins", () => {
    expect(allows("https://kith.ng")).toBe(true);
    expect(allows("https://www.kith.ng", ["https://kith.ng", "https://www.kith.ng"])).toBe(true);
  });

  it("allows sandbox preview hosts and local development", () => {
    expect(allows("https://3000-abc123.e2b.app")).toBe(true);
    expect(allows("http://localhost:3000")).toBe(true);
    expect(allows("http://127.0.0.1:3001")).toBe(true);
  });

  it("allows non-browser clients (no Origin header)", () => {
    expect(allows(undefined)).toBe(true);
  });

  it("refuses unrelated websites and malformed origins", () => {
    expect(allows("https://evil.example")).toBe(false);
    expect(allows("https://kith.ng.evil.example")).toBe(false);
    expect(allows("not-a-url")).toBe(false);
  });
});
