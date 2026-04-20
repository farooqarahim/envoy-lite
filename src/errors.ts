import type { EnvoyIssue } from "./types";

export class EnvoyError extends Error {
  override readonly name = "EnvoyError";
  readonly issues: readonly EnvoyIssue[];
  readonly context: string | undefined;

  constructor(issues: EnvoyIssue[], context?: string) {
    super(buildSummary(issues, context));
    this.issues = Object.freeze(issues.slice());
    this.context = context;
  }
}

function buildSummary(issues: EnvoyIssue[], context?: string): string {
  return `${issues.length} environment variable(s) failed validation${
    context ? ` [${context}]` : ""
  }.`;
}
