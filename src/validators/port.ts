import type { Validator } from "../types";
import { num } from "./num";

export function port(): Validator<number> {
  return num({ integer: true, min: 1, max: 65535 });
}
