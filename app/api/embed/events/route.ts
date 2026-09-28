import {
  createEvent,
  EmbedEventInput,
  listEvents,
} from "@/lib/embed-db/repository";
import { jsonError, readJson } from "@/lib/embed-db/api";
import { requireEmbedToken } from "@/lib/embed/embedToken";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const token = requireEmbedToken(request);
    return Response.json({
      events: await listEvents(token.clientId),
    });
  } catch (error) {
    return jsonError(error, error instanceof Error ? 401 : 500);
  }
}

export async function POST(request: Request) {
  try {
    const token = requireEmbedToken(request);
    return Response.json(
      {
        event: await createEvent(
          token.clientId,
          await readJson<EmbedEventInput>(request),
        ),
      },
      { status: 201 },
    );
  } catch (error) {
    return jsonError(error);
  }
}
