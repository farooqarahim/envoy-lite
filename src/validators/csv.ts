import type { ParseResult, Validator } from "../types";
import { makeValidator } from "./base";

export type AllowEmpty = "skip" | "keep" | false;

export interface CsvOptions {
  separator?: string;
  trim?: boolean;
  allowEmpty?: AllowEmpty;
}

export function csv<T>(item: Validator<T>, opts: CsvOptions = {}): Validator<T[]> {
  const separator = opts.separator ?? ",";
  const doTrim = opts.trim ?? true;
  const allowEmpty = opts.allowEmpty ?? false;
  return makeValidator<T[]>((input) => parseCsv(input, item, separator, doTrim, allowEmpty));
}

function parseCsv<T>(
  input: string | undefined,
  item: Validator<T>,
  separator: string,
  doTrim: boolean,
  allowEmpty: AllowEmpty
): ParseResult<T[]> {
  if (input === undefined) {
    return { ok: false, issue: { code: "MISSING", message: "Required value not set." } };
  }
  const rawPieces = input.split(separator);
  const pieces = doTrim ? rawPieces.map((p) => p.trim()) : rawPieces;
  const values: T[] = [];
  const itemIssues: Array<{ index: number; code: string; message: string }> = [];

  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i]!;

    if (piece.length === 0) {
      if (allowEmpty === "skip") continue;
      if (allowEmpty === false) {
        itemIssues.push({ index: i, code: "EMPTY_ITEM", message: `Item at index ${i} is empty.` });
        continue;
      }
      // "keep" falls through to let the item validator decide
    }

    const result = item.parse(piece);
    if (result.ok) {
      values.push(result.value);
    } else {
      itemIssues.push({
        index: i,
        code: result.issue.code,
        message: result.issue.message
      });
    }
  }

  if (itemIssues.length > 0) {
    const first = itemIssues[0]!;
    return {
      ok: false,
      issue:
        first.code === "EMPTY_ITEM"
          ? {
              code: "EMPTY_ITEM",
              message: `Item at index ${first.index} is empty.`,
              meta: { index: first.index, issues: itemIssues }
            }
          : {
              code: "INVALID_ITEM",
              message: `Item at index ${first.index} failed validation: ${first.message}`,
              meta: {
                index: first.index,
                code: first.code,
                message: first.message,
                issues: itemIssues
              }
            }
    };
  }

  return { ok: true, value: values };
}
