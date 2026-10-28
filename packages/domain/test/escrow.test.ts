import { describe, expect, it } from "vitest";
import { canTransition, transition, EscrowError } from "../src/escrow";
import { validateMatric, isValidNin } from "../src/universities";

describe("escrow state machine", () => {
  it("happy path: paystack holds, porter releases", () => {
    let s = transition("pending", "held", "paystack");
    s = transition(s, "released", "porter");
    expect(s).toBe("released");
  });
  it("auto-release worker may release; paystack may not", () => {
    expect(canTransition("held", "released", "worker")).toBe(true);
    expect(canTransition("held", "released", "paystack")).toBe(false);
  });
  it("dispute only by admin, resolves released|refunded, terminal states lock", () => {
    expect(transition("held", "disputed", "admin")).toBe("disputed");
    expect(transition("disputed", "refunded", "admin")).toBe("refunded");
    expect(() => transition("released", "disputed", "admin")).toThrow(EscrowError);
    expect(() => transition("refunded", "held", "paystack")).toThrow(EscrowError);
  });
  it("porter cannot release a disputed escrow", () => {
    expect(() => transition("disputed", "released", "porter")).toThrow(EscrowError);
  });
});

describe("university gates", () => {
  const ok = { universityCode: "funaab", matricNumber: "U22/AGR/001", studentEmail: "a@stu.funaab.edu.ng" };
  it("accepts a valid FUNAAB student", () => expect(validateMatric(ok)).toMatchObject({ ok: true }));
  it("rejects wrong matric format", () =>
    expect(validateMatric({ ...ok, matricNumber: "22/AGR/1" })).toMatchObject({ ok: false, code: "matric_format" }));
  it("rejects personal email domain", () =>
    expect(validateMatric({ ...ok, studentEmail: "a@gmail.com" })).toMatchObject({ ok: false, code: "email_domain" }));
  it("rejects unknown university", () =>
    expect(validateMatric({ ...ok, universityCode: "hogwarts" })).toMatchObject({ ok: false, code: "unknown_university" }));
  it("UNILAG matric shape accepted", () =>
    expect(validateMatric({ universityCode: "unilag", matricNumber: "22ENG0100234", studentEmail: "b@stu.unilag.edu.ng" })).toMatchObject({ ok: true }));
});

describe("NIN", () => {
  it("11 digits only", () => {
    expect(isValidNin("12345678901")).toBe(true);
    expect(isValidNin("1234567890")).toBe(false);
    expect(isValidNin("1234567890a")).toBe(false);
  });
});
