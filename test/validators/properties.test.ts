import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { num } from "../../src/validators/num";
import { host } from "../../src/validators/host";
import { email } from "../../src/validators/email";

describe("property: num()", () => {
  it("JSON.stringify(n) always round-trips through num().parse for safe integers", () => {
    fc.assert(
      fc.property(fc.integer({ min: -1_000_000, max: 1_000_000 }), (n) => {
        const result = num().parse(JSON.stringify(n));
        return result.ok && result.value === n;
      })
    );
  });

  it("finite decimals round-trip", () => {
    fc.assert(
      fc.property(
        fc.double({ noNaN: true, noDefaultInfinity: true, min: -1e6, max: 1e6 }),
        (n) => {
          const str = JSON.stringify(n);
          const result = num().parse(str);
          return result.ok && Math.abs(result.value - n) < 1e-9;
        }
      )
    );
  });

  it("rejects any string containing non-numeric characters at the boundaries", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.stringMatching(/^[a-zA-Z]$/),
        (n, letter) => {
          const input = `${n}${letter}`;
          return num().parse(input).ok === false;
        }
      )
    );
  });
});

describe("property: host()", () => {
  it("accepts any single-label lowercase alnum hostname", () => {
    fc.assert(
      fc.property(fc.stringMatching(/^[a-z][a-z0-9]{0,20}$/), (h) => {
        return host().parse(h).ok;
      })
    );
  });

  it("rejects hostnames containing spaces", () => {
    fc.assert(
      fc.property(fc.stringMatching(/^[a-z]+ [a-z]+$/), (h) => {
        return host().parse(h).ok === false;
      })
    );
  });

  it("accepts valid IPv4 octets", () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 0, max: 255 }),
          fc.integer({ min: 0, max: 255 }),
          fc.integer({ min: 0, max: 255 }),
          fc.integer({ min: 0, max: 255 })
        ),
        ([a, b, c, d]) => host().parse(`${a}.${b}.${c}.${d}`).ok
      )
    );
  });

  it("rejects IPv4 octets above 255", () => {
    fc.assert(
      fc.property(fc.integer({ min: 256, max: 999 }), (n) => {
        return host().parse(`${n}.0.0.0`).ok === false;
      })
    );
  });
});

describe("property: email()", () => {
  it("accepts local@domain.tld where parts are alnum", () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z][a-z0-9]{0,10}$/),
        fc.stringMatching(/^[a-z][a-z0-9]{0,10}$/),
        fc.stringMatching(/^[a-z]{2,6}$/),
        (local, domain, tld) => {
          const result = email().parse(`${local}@${domain}.${tld}`);
          expect(result.ok).toBe(true);
        }
      )
    );
  });

  it("rejects anything without exactly one @", () => {
    fc.assert(
      fc.property(fc.stringMatching(/^[a-z]+$/), (s) => {
        return email().parse(s).ok === false;
      })
    );
  });
});
