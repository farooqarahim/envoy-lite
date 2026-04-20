import type { ParseResult, Validator } from "../types";

export interface MakeValidatorOptions {
  sensitive?: boolean;
  description?: string;
  isOptional?: boolean;
}

export function makeValidator<T>(
  parse: (input: string | undefined) => ParseResult<T>,
  options: MakeValidatorOptions = {}
): Validator<T> {
  const sensitive = options.sensitive ?? false;
  const description = options.description;
  const isOptional = options.isOptional ?? false;

  const derivedOptions = (overrides?: Partial<MakeValidatorOptions>): MakeValidatorOptions => {
    const out: MakeValidatorOptions = {
      sensitive: overrides?.sensitive ?? sensitive,
      isOptional: overrides?.isOptional ?? isOptional
    };
    const desc = overrides && "description" in overrides ? overrides.description : description;
    if (desc !== undefined) out.description = desc;
    return out;
  };

  const v: Validator<T> = {
    parse,
    sensitive,
    description,
    _output: undefined as unknown as T,
    _isOptional: isOptional,

    optional(): Validator<T | undefined> {
      return makeValidator<T | undefined>(
        (input) => {
          if (input === undefined) return { ok: true, value: undefined };
          return parse(input) as ParseResult<T | undefined>;
        },
        derivedOptions({ isOptional: true })
      );
    },

    default<const D extends Exclude<T, undefined>>(
      value: D
    ): [undefined] extends [T] ? never : Validator<D> {
      if (isOptional) {
        throw new TypeError(
          "Cannot call .default() after .optional(). Use .default() on a required validator instead."
        );
      }
      return makeValidator<D>(
        (input) => {
          if (input === undefined) return { ok: true, value };
          const inner = parse(input);
          if (!inner.ok) return inner;
          return { ok: true, value: inner.value as unknown as D };
        },
        derivedOptions()
      ) as [undefined] extends [T] ? never : Validator<D>;
    },

    transform<U>(fn: (value: T) => U): Validator<U> {
      return makeValidator<U>(
        (input) => {
          const inner = parse(input);
          if (!inner.ok) return inner;
          try {
            return { ok: true, value: fn(inner.value) };
          } catch (err) {
            return {
              ok: false,
              issue: {
                code: "INVALID_TYPE",
                message: `Transform threw: ${(err as Error).message}`
              }
            };
          }
        },
        derivedOptions()
      );
    },

    refine(predicate: (value: T) => boolean, message = "Value failed refinement."): Validator<T> {
      return makeValidator<T>(
        (input) => {
          const inner = parse(input);
          if (!inner.ok) return inner;
          let passed: boolean;
          try {
            passed = predicate(inner.value);
          } catch (err) {
            return {
              ok: false,
              issue: {
                code: "REFINE_FAILED",
                message: `Refinement threw: ${(err as Error).message}`
              }
            };
          }
          if (!passed) {
            return {
              ok: false,
              issue: { code: "REFINE_FAILED", message }
            };
          }
          return inner;
        },
        derivedOptions()
      );
    },

    describe(text: string): Validator<T> {
      return makeValidator<T>(parse, derivedOptions({ description: text }));
    }
  };
  return v;
}
