import { createEmbedMapToken } from "@/lib/embed/embedToken";
import { queryPostgres } from "@/lib/db/postgres";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clientId = searchParams.get("clientId");
  const allowedLayers = ["compass-bennet"];

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 },
    );
  }

  const clientResult = await queryPostgres<{
    allowed_origin: string;
  }>("select allowed_origin from embed_clients where id = $1", [clientId]);
  const allowedOrigin = clientResult.rows[0]?.allowed_origin;

  if (!allowedOrigin) {
    return NextResponse.json(
      { error: "Embed client was not found" },
      { status: 404 },
    );
  }

  const token = createEmbedMapToken({
    allowed_layers: allowedLayers,
    allowedOrigin,
    clientId,
  });

  return NextResponse.json({
    allowed_layers: allowedLayers,
    token,
    iframeUrl: `/he/embed/map?token=${encodeURIComponent(token)}`,
  });
}
