import { readFileSync } from "fs";
import { resolve } from "path";
import { BaseConfig, BaseConfigZod } from "./base-config.zod";

let existingInstance: ConfigService = null;

function escapeRegex(key: string) {
  return key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractDoubleCurlyKeys(text: string): string[] {
  const re = /\{\{\s*([^{}]+?)\s*\}\}/g;
  const out: string[] = [];

  for (const match of text.matchAll(re)) {
    out.push(match[1].trim());
  }

  return Array.from(new Set(out));
}

export class ConfigService {
  constructor(private readonly config: BaseConfig) {}

  getConfig(): BaseConfig {
    return this.config;
  }

  public static async create(): Promise<ConfigService> {
    if (existingInstance) {
      return existingInstance;
    }

    // Read and validate the config
    const configPath = process.env.CONFIG_PATH;
    const filePath = resolve(configPath);

    let raw = readFileSync(filePath, "utf-8");

    // Process ENV vars
    const allEnvVars = extractDoubleCurlyKeys(raw);
    const templatedRaw = allEnvVars.reduce((acc, curr) => {
      const currEnvVar = process.env[curr];

      if (currEnvVar === undefined) {
        throw new Error(`Missing ENV var with name "${curr}"`);
      }

      const placeholderRegex = new RegExp(
        `\\{\\{\\s*${escapeRegex(curr)}\\s*\\}\\}`,
        "g",
      );

      return acc.replace(placeholderRegex, currEnvVar);
    }, raw);

    const config = JSON.parse(templatedRaw);
    const parsed = await BaseConfigZod.safeParseAsync(config);

    if (!parsed.success) {
      console.error("Config parsing failed:", parsed.error.message);
      return;
    }

    existingInstance = new ConfigService(parsed.data);

    return existingInstance;
  }
}
