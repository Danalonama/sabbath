import "server-only";
import { Client, Pool, PoolConfig, QueryResultRow } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

const DEFAULT_DB_HOST =
  "insight-dev.cv80g68ycux1.eu-central-1.rds.amazonaws.com";
const DEFAULT_DB_PORT = 2232;
const DEFAULT_DB_NAME = "postgres";
const DEFAULT_DB_SCHEMA = "embed";

declare global {
  // eslint-disable-next-line no-var
  var __agamPostgresPool: Pool | undefined;
}

const getEnv = (...keys: string[]) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value) return value;
  }
};

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (!value) return fallback;
  return ["1", "true", "yes"].includes(value.toLowerCase());
};

const getSslConfig = () => {
  if (!parseBoolean(getEnv("POSTGRES_SSL"), true)) return false;

  const caPath = getEnv("POSTGRES_CA_PATH");

  return {
    ...(caPath
      ? {
          ca: readFileSync(join(process.cwd(), caPath)).toString(),
        }
      : {}),
    rejectUnauthorized: parseBoolean(
      getEnv("POSTGRES_SSL_REJECT_UNAUTHORIZED"),
      false,
    ),
  };
};

const getPoolConfig = (): PoolConfig => {
  const host = getEnv("POSTGRES_HOST", "PGHOST") ?? DEFAULT_DB_HOST;
  const user = getEnv("POSTGRES_USERNAME", "POSTGRES_USER", "PGUSER");
  const password = getEnv("POSTGRES_PASSWORD", "PGPASSWORD");

  if (!host || !user || !password) {
    throw new Error(
      "PostgreSQL connection is missing host, user, or password configuration",
    );
  }

  return {
    host,
    port: Number(getEnv("POSTGRES_PORT", "PGPORT") ?? DEFAULT_DB_PORT),
    database: getEnv("POSTGRES_DATABASE", "PGDATABASE") ?? DEFAULT_DB_NAME,
    user,
    password,
    max: Number(getEnv("POSTGRES_POOL_MAX") ?? 5),
    options: `-c search_path=${getEnv("POSTGRES_SCHEMA") ?? DEFAULT_DB_SCHEMA},public`,
    ssl: getSslConfig(),
  };
};

export const createPostgresClient = () => new Client(getPoolConfig());

export const getPostgresPool = async () => {
  if (!global.__agamPostgresPool) {
    global.__agamPostgresPool = new Pool(getPoolConfig());
  }

  return global.__agamPostgresPool;
};

export const queryPostgres = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: unknown[],
) => {
  const pool = await getPostgresPool();
  return pool.query<T>(text, values);
};
