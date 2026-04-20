import { describe, it, expect } from "vitest";
import { host } from "../../src/validators/host";

describe("host", () => {
  it("accepts IPv4", () => {
    expect(host().parse("1.2.3.4")).toEqual({ ok: true, value: "1.2.3.4" });
  });
  it("accepts localhost", () => {
    expect(host().parse("localhost")).toEqual({ ok: true, value: "localhost" });
  });
  it("accepts hostname", () => {
    expect(host().parse("example.com")).toEqual({ ok: true, value: "example.com" });
  });
  it("accepts bracketed IPv6", () => {
    expect(host().parse("[::1]")).toEqual({ ok: true, value: "[::1]" });
  });
  it("accepts unbracketed IPv6", () => {
    expect(host().parse("::1")).toEqual({ ok: true, value: "::1" });
  });
  it("MISSING undefined", () => {
    expect(host().parse(undefined)).toMatchObject({ ok: false, issue: { code: "MISSING" } });
  });
  it("EMPTY empty string", () => {
    expect(host().parse("")).toMatchObject({ ok: false, issue: { code: "EMPTY" } });
  });
  it("INVALID_HOST for underscore", () => {
    expect(host().parse("bad_host")).toMatchObject({ ok: false, issue: { code: "INVALID_HOST" } });
  });
});
