import type { Schema } from "./types";

export interface GenerateExampleOptions {
  header?: string;
  includeDescriptions?: boolean;
}

export function generateExample(schema: Schema, options: GenerateExampleOptions = {}): string {
  const includeDescriptions = options.includeDescriptions ?? true;
  const lines: string[] = [];
  if (options.header) {
    for (const line of options.header.split("\n")) {
      lines.push(`# ${line}`);
    }
    lines.push("");
  }

  const keys = Object.keys(schema);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    const validator = schema[key]!;

    if (includeDescriptions && validator.description) {
      for (const line of validator.description.split("\n")) {
        lines.push(`# ${line}`);
      }
    }

    const rhs = defaultRhs(validator);
    lines.push(`${key}=${rhs}`);
    if (i < keys.length - 1) lines.push("");
  }

  return lines.join("\n") + "\n";
}

function defaultRhs(validator: { sensitive: boolean }): string {
  return validator.sensitive ? "<REDACTED>" : "<REQUIRED>";
}
