import { describe, it, expect } from "vitest";
import { url } from "../../src/validators/url";

describe("url", () => {
  it("accepts https URL", () => {
    expect(url().parse("https://example.com")).toEqual({
      ok: true,
      value: "https://example.com"
    });
  });
  it("accepts http URL", () => {
    expect(url().parse("http://example.com")).toEqual({
      ok: true,
      value: "http://example.com"
    });
  });
  it("MISSING undefined", () => {
    expect(url().parse(undefined)).toMatchObject({ ok: false, issue: { code: "MISSING" } });
  });
  it("EMPTY empty", () => {
    expect(url().parse("")).toMatchObject({ ok: false, issue: { code: "EMPTY" } });
  });
  it("INVALID_URL when no protocol", () => {
    expect(url().parse("example.com")).toMatchObject({ ok: false, issue: { code: "INVALID_URL" } });
  });
  it("INVALID_PROTOCOL for ftp", () => {
    expect(url().parse("ftp://x")).toMatchObject({
      ok: false,
      issue: { code: "INVALID_PROTOCOL" }
    });
  });
  it("custom protocols", () => {
    expect(url({ protocols: ["postgres"] }).parse("postgres://host/db")).toEqual({
      ok: true,
      value: "postgres://host/db"
    });
  });
});
