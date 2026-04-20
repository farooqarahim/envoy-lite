export interface Validator<T> {
  parse(input: string | undefined): ParseResult<T>;
  optional(): Validator<T | undefined>;
  default<const D extends Exclude<T, undefined>>(
    value: D
  ): [undefined] extends [T] ? never : Validator<D>;
  transform<U>(fn: (value: T) => U): Validator<U>;
  refine(predicate: (value: T) => boolean, message?: string): Validator<T>;
  describe(text: string): Validator<T>;
  readonly sensitive: boolean;
  readonly description: string | undefined;
  readonly _output: T;
  readonly _isOptional: boolean;
}

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; issue: Omit<EnvoyIssue, "name"> };

export type Source = Readonly<Record<string, unknown>>;

export interface EnvoyOptions {
  source?: Source;
  context?: string;
  strict?: boolean;
}

export interface FormatErrorsOptions {
  color?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Schema = Record<string, Validator<any>>;

export type Infer<S extends Schema> = {
  -readonly [K in keyof S]: S[K] extends Validator<infer U> ? U : never;
};

export type EnvoyErrorCode =
  | "MISSING"
  | "EMPTY"
  | "INVALID_TYPE"
  | "INVALID_BOOL"
  | "INVALID_ENUM"
  | "INVALID_URL"
  | "INVALID_PROTOCOL"
  | "INVALID_EMAIL"
  | "INVALID_HOST"
  | "INVALID_JSON"
  | "INVALID_ITEM"
  | "INVALID_BIGINT"
  | "INVALID_DATE"
  | "INVALID_DURATION"
  | "INVALID_BASE64"
  | "INVALID_REGEX"
  | "TOO_SHORT"
  | "TOO_LONG"
  | "OUT_OF_RANGE"
  | "PATTERN_MISMATCH"
  | "REFINE_FAILED"
  | "EMPTY_ITEM"
  | "UNKNOWN_KEY"
  | "NO_SOURCE";

export interface EnvoyIssue {
  name: string;
  code: EnvoyErrorCode;
  message: string;
  meta?: Record<string, unknown>;
}

import type { EnvoyError } from "./errors";

export type SafeEnvoyResult<T> =
  | { ok: true; data: Readonly<T> }
  | { ok: false; error: EnvoyError };
