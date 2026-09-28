import { existsSync, readFileSync } from "fs";
import { join } from "path";
import pg from "pg";

const loadEnvFile = (path) => {
  if (!existsSync(path)) return;

  const envFile = readFileSync(path, "utf8");

  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts
      .join("=")
      .trim()
      .replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
};

const getEnv = (...keys) => {
  for (const key of keys) {
    if (process.env[key]) return process.env[key];
  }
};

const parseBoolean = (value, fallback) => {
  if (!value) return fallback;
  return ["1", "true", "yes"].includes(value.toLowerCase());
};

loadEnvFile(".env.local");

const caPath = getEnv("POSTGRES_CA_PATH");
const ssl = parseBoolean(getEnv("POSTGRES_SSL"), true)
  ? {
      ...(caPath
        ? {
            ca: readFileSync(join(process.cwd(), caPath)).toString(),
          }
        : {}),
      rejectUnauthorized: parseBoolean(
        getEnv("POSTGRES_SSL_REJECT_UNAUTHORIZED"),
        false,
      ),
    }
  : false;

const client = new pg.Client({
  host:
    getEnv("POSTGRES_HOST", "PGHOST") ??
    "insight-dev.cv80g68ycux1.eu-central-1.rds.amazonaws.com",
  port: Number(getEnv("POSTGRES_PORT", "PGPORT") ?? 2232),
  database: getEnv("POSTGRES_DATABASE", "PGDATABASE") ?? "postgres",
  user: getEnv("POSTGRES_USERNAME", "POSTGRES_USER", "PGUSER"),
  password: getEnv("POSTGRES_PASSWORD", "PGPASSWORD"),
  options: `-c search_path=${getEnv("POSTGRES_SCHEMA") ?? "embed"},public`,
  ssl,
});

try {
  const sql = readFileSync("scripts/create-embed-tables.sql", "utf8");
  await client.connect();
  await client.query(sql);
  console.log("Embed tables are ready.");
} finally {
  await client.end();
}
