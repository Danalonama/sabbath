import { EmbeddedMapTokenPayload } from "@/types/embed-map";
import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_VERSION = 1;

const getSecret = () =>
  process.env.EMBED_MAP_TOKEN_SECRET ??
  "development-only-embed-map-token-secret-change-me";

const base64UrlEncode = (value: Buffer | string) =>
  (Buffer.isBuffer(value) ? value : Buffer.from(value))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const base64UrlDecode = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
};

const sign = (value: string) =>
  base64UrlEncode(createHmac("sha256", getSecret()).update(value).digest());

export const createEmbedMapToken = (
  payload: Omit<EmbeddedMapTokenPayload, "exp" | "iat" | "version">,
) => {
  const body: EmbeddedMapTokenPayload = {
    allowed_layers: payload.allowed_layers,
    allowedOrigin: payload.allowedOrigin,
    clientId: payload.clientId,
    version: TOKEN_VERSION,
  };

  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const unsignedToken = `${header}.${encodedPayload}`;

  return `${unsignedToken}.${sign(unsignedToken)}`;
};

export const verifyEmbedMapToken = (token: string) => {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    throw new Error("Malformed embed token");
  }

  const expectedSignature = sign(`${header}.${payload}`);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    throw new Error("Invalid embed token signature");
  }

  const decodedPayload = JSON.parse(
    base64UrlDecode(payload),
  ) as EmbeddedMapTokenPayload;

  if (decodedPayload.version !== TOKEN_VERSION) {
    throw new Error("Unsupported embed token version");
  }

  return decodedPayload;
};

export const getEmbedTokenFromRequest = (request: Request) => {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }

  return new URL(request.url).searchParams.get("token");
};

export const requireEmbedToken = (request: Request) => {
  const token = getEmbedTokenFromRequest(request);

  if (!token) {
    throw new Error("Missing embed token");
  }

  return verifyEmbedMapToken(token);
};
