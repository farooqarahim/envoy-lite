import type { Validator } from "../types";
import { buildStr, type StrOptions } from "./str";

export function secret(opts: StrOptions = {}): Validator<string> {
  return buildStr(opts, { sensitive: true });
}
