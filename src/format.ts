import type { EnvoyError } from "./errors";
import type { FormatErrorsOptions } from "./types";

const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

export function formatErrors(error: EnvoyError, options: FormatErrorsOptions = {}): string {
  const issues = error.issues;
  if (issues.length === 0) return error.message;

  const color = options.color ?? false;
  const paint = (code: string, text: string): string => (color ? `${code}${text}${RESET}` : text);

  const noSource = issues.find((i) => i.code === "NO_SOURCE");
  if (noSource) {
    const header = paint(BOLD + RED, "Envoy: no environment source available");
    return `${header}\n  ${noSource.message}`;
  }

  let nameWidth = 0;
  let codeWidth = 0;
  for (const issue of issues) {
    if (issue.name.length > nameWidth) nameWidth = issue.name.length;
    if (issue.code.length > codeWidth) codeWidth = issue.code.length;
  }

  const lines: string[] = [paint(BOLD, error.message), ""];
  for (const issue of issues) {
    const name = issue.name.padEnd(nameWidth, " ");
    const code = issue.code.padEnd(codeWidth, " ");
    const prefix = paint(RED, "x");
    const codePainted = paint(YELLOW, code);
    lines.push(`  ${prefix} ${name}  ${codePainted}  ${issue.message}`);
  }
  return lines.join("\n");
}
