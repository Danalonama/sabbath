import {
  getEmbedTokenFromRequest,
  requireEmbedToken,
} from "@/lib/embed/embedToken";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: {
    layerName: string;
  };
};

const getBackendUrl = (path: string) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.SOURCE_API_URL ??
    "http://127.0.0.1:8000/";

  return new URL(
    path.replace(/^\//, ""),
    baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
  );
};

export async function GET(request: Request, { params }: RouteContext) {
  const embedToken = getEmbedTokenFromRequest(request);
  let tokenPayload;

  try {
    tokenPayload = requireEmbedToken(request);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 },
    );
  }

  const layerName = decodeURIComponent(params.layerName);

  if (!tokenPayload.allowed_layers?.includes(layerName)) {
    return Response.json(
      { error: "Layer is not allowed for this embed token" },
      { status: 403 },
    );
  }

  const backendResponse = await fetch(
    getBackendUrl(`/api/map/research/layers/${encodeURIComponent(layerName)}`),
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(embedToken ? { Authorization: `Bearer ${embedToken}` } : {}),
        user: `embed:${tokenPayload.clientId}`,
        "x-agam-allowed-layers": tokenPayload.allowed_layers.join(","),
        "x-agam-embed-client-id": tokenPayload.clientId,
        "x-agam-embed-origin": tokenPayload.allowedOrigin,
      },
    },
  );
  const contentType = backendResponse.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await backendResponse.json()
    : await backendResponse.text();

  if (!backendResponse.ok) {
    return Response.json(
      {
        error: "Failed to load research layer",
        detail: payload,
      },
      { status: backendResponse.status },
    );
  }

  return Response.json({
    embed: typeof payload === "object" && payload ? payload.embed : undefined,
    layer:
      typeof payload === "object" && payload && "layer" in payload
        ? payload.layer
        : payload,
    layerName,
  });
}
