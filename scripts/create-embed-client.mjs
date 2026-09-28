import { existsSync, readFileSync } from "fs";
import pg from "pg";
import { randomUUID } from "crypto";

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

const [, , name, allowedOrigin] = process.argv;

if (!name || !allowedOrigin) {
  throw new Error(
    "Usage: node scripts/create-embed-client.mjs <name> <allowed-origin>",
  );
}

loadEnvFile(".env.local");

const client = new pg.Client({
  host:
    getEnv("POSTGRES_HOST", "PGHOST") ??
    "insight-dev.cv80g68ycux1.eu-central-1.rds.amazonaws.com",
  port: Number(getEnv("POSTGRES_PORT", "PGPORT") ?? 2232),
  database: getEnv("POSTGRES_DATABASE", "PGDATABASE") ?? "postgres",
  user: getEnv("POSTGRES_USERNAME", "POSTGRES_USER", "PGUSER"),
  password: getEnv("POSTGRES_PASSWORD", "PGPASSWORD"),
  options: `-c search_path=${getEnv("POSTGRES_SCHEMA") ?? "embed"},public`,
  ssl: parseBoolean(getEnv("POSTGRES_SSL"), true)
    ? {
        rejectUnauthorized: parseBoolean(
          getEnv("POSTGRES_SSL_REJECT_UNAUTHORIZED"),
          false,
        ),
      }
    : false,
});

try {
  await client.connect();
  const result = await client.query(
    `insert into embed_clients (id, name, allowed_origin)
     values ($1, $2, $3)
     returning id, name, allowed_origin`,
    [randomUUID(), name, allowedOrigin],
  );
  console.log(JSON.stringify(result.rows[0], null, 2));
} finally {
  await client.end();
}
