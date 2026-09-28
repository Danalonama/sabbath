import {
  deleteEvent,
  EmbedEventInput,
  getEvent,
  updateEvent,
} from "@/lib/embed-db/repository";
import { jsonError, jsonNotFound, readJson } from "@/lib/embed-db/api";
import { requireEmbedToken } from "@/lib/embed/embedToken";

type RouteContext = {
  params: {
    id: string;
  };
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const token = requireEmbedToken(_request);
    const event = await getEvent(token.clientId, params.id);
    return event ? Response.json({ event }) : jsonNotFound();
  } catch (error) {
    return jsonError(error, error instanceof Error ? 401 : 500);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const token = requireEmbedToken(request);
    const event = await updateEvent(
      token.clientId,
      params.id,
      await readJson<EmbedEventInput>(request),
    );
    return event ? Response.json({ event }) : jsonNotFound();
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const token = requireEmbedToken(_request);
    const deleted = await deleteEvent(token.clientId, params.id);
    return deleted ? Response.json({ deleted }) : jsonNotFound();
  } catch (error) {
    return jsonError(error);
  }
}
