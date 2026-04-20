import { EnvoyError } from "./errors";
import { resolveSource } from "./source";
import type {
  EnvoyIssue,
  EnvoyOptions,
  Infer,
  SafeEnvoyResult,
  Schema,
  Source
} from "./types";

export const SENSITIVE_KEYS: unique symbol = Symbol("envoy.sensitiveKeys");

export function envoy<S extends Schema>(
  schema: S,
  options: EnvoyOptions = {}
): Readonly<Infer<S>> {
  const result = runEnvoy(schema, options);
  if (!result.ok) throw result.error;
  return result.data;
}

export function safeEnvoy<S extends Schema>(
  schema: S,
  options: EnvoyOptions = {}
): SafeEnvoyResult<Infer<S>> {
  return runEnvoy(schema, options);
}

export function pickSchema<S extends Schema, K extends keyof S>(
  schema: S,
  keys: readonly K[]
): Pick<S, K> {
  const out = {} as Pick<S, K>;
  for (const key of keys) {
    if (Object.hasOwn(schema, key as PropertyKey)) {
      out[key] = schema[key]!;
    }
  }
  return out;
}

export function extendSchema<A extends Schema, B extends Schema>(base: A, extension: B): A & B {
  const out = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(extension)) {
    if (isUnsafeSchemaKey(key)) continue;
    out[key] = extension[key]!;
  }
  return out as A & B;
}

export function partialSchema<S extends Schema>(
  schema: S
): { [K in keyof S]: ReturnType<S[K]["optional"]> } {
  const out = {} as Record<string, unknown>;
  for (const key of Object.keys(schema)) {
    if (isUnsafeSchemaKey(key)) continue;
    out[key] = schema[key]!.optional();
  }
  return out as { [K in keyof S]: ReturnType<S[K]["optional"]> };
}

function runEnvoy<S extends Schema>(
  schema: S,
  options: EnvoyOptions
): SafeEnvoyResult<Infer<S>> {
  const source: Source | null = options.source ?? resolveSource();
  if (!source || typeof source !== "object") {
    return {
      ok: false,
      error: new EnvoyError(
        [
          {
            name: "<source>",
            code: "NO_SOURCE",
            message: "No environment source available. Pass options.source explicitly."
          }
        ],
        options.context
      )
    };
  }

  const issues: EnvoyIssue[] = [];
  const result: Record<string, unknown> = {};
  const sensitive = new Set<string>();
  const schemaKeys = Object.keys(schema).filter((k) => !isUnsafeSchemaKey(k));

  for (const key of schemaKeys) {
    const validator = schema[key]!;
    const rawRead = readKey(source, key);

    if (rawRead.kind === "invalidType") {
      const issue: EnvoyIssue = {
        name: key,
        code: "INVALID_TYPE",
        message: `Expected string environment value. Received: ${rawRead.actualType}.`
      };
      if (!validator.sensitive) {
        issue.meta = { expected: "string", received: rawRead.actualType };
      }
      issues.push(issue);
      continue;
    }

    const raw = rawRead.value;
    let parsed;
    try {
      parsed = validator.parse(raw);
    } catch (err) {
      issues.push({
        name: key,
        code: "INVALID_TYPE",
        message: `Validator threw: ${(err as Error).message}`
      });
      continue;
    }

    if (parsed.ok) {
      result[key] = parsed.value;
      if (validator.sensitive) sensitive.add(key);
    } else {
      issues.push(buildIssue(key, parsed.issue, validator.sensitive));
    }
  }

  if (options.strict) {
    for (const srcKey of Object.keys(source)) {
      if (isUnsafeSchemaKey(srcKey)) continue;
      if (Object.hasOwn(schema, srcKey)) continue;
      const suggestion = suggestKey(srcKey, schemaKeys);
      const issue: EnvoyIssue = {
        name: srcKey,
        code: "UNKNOWN_KEY",
        message: suggestion
          ? `Unknown environment variable "${srcKey}". Did you mean "${suggestion}"?`
          : `Unknown environment variable "${srcKey}".`
      };
      if (suggestion) issue.meta = { suggestion };
      issues.push(issue);
    }
  }

  if (issues.length) {
    return { ok: false, error: new EnvoyError(issues, options.context) };
  }

  // Enumerable so that object spread ({...env}) preserves sensitivity metadata.
  // Symbol keys are skipped by Object.keys / JSON.stringify / for..in, so this
  // stays invisible to normal iteration.
  Object.defineProperty(result, SENSITIVE_KEYS, {
    value: sensitive,
    enumerable: true,
    writable: false,
    configurable: false
  });
  Object.freeze(result);
  return { ok: true, data: result as Readonly<Infer<S>> };
}

type ReadResult =
  | { kind: "value"; value: string | undefined }
  | { kind: "invalidType"; actualType: string };

function readKey(source: Source, key: string): ReadResult {
  if (!Object.hasOwn(source, key)) return { kind: "value", value: undefined };
  const v = (source as Record<string, unknown>)[key];
  if (v === undefined || v === null) return { kind: "value", value: undefined };
  if (typeof v === "string") return { kind: "value", value: v };
  return { kind: "invalidType", actualType: typeof v };
}

function buildIssue(
  name: string,
  raw: Omit<EnvoyIssue, "name">,
  sensitive: boolean
): EnvoyIssue {
  const issue: EnvoyIssue = {
    name,
    code: raw.code,
    message: sensitive ? redactMessage(raw.message) : raw.message
  };
  if (!sensitive && raw.meta !== undefined) {
    issue.meta = raw.meta;
  }
  return issue;
}

function redactMessage(message: string): string {
  return message.replace(/Received:[^]*$/, "Received: [REDACTED]");
}

export function getSensitive(env: object): Set<string> | undefined {
  const holder = env as Record<PropertyKey, unknown>;
  const value = holder[SENSITIVE_KEYS];
  return value instanceof Set ? (value as Set<string>) : undefined;
}

function isUnsafeSchemaKey(key: string): boolean {
  return key === "__proto__" || key === "prototype" || key === "constructor";
}

function suggestKey(input: string, candidates: readonly string[]): string | undefined {
  if (candidates.length === 0) return undefined;
  const threshold = Math.max(1, Math.min(3, Math.ceil(input.length / 3)));
  let bestKey: string | undefined;
  let bestDist = Infinity;
  for (const candidate of candidates) {
    const dist = levenshtein(input, candidate);
    if (dist < bestDist) {
      bestDist = dist;
      bestKey = candidate;
    }
  }
  return bestKey !== undefined && bestDist <= threshold ? bestKey : undefined;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n]!;
}
