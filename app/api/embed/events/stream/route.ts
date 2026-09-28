import { requireEmbedToken } from "@/lib/embed/embedToken";
import { createPostgresClient } from "@/lib/db/postgres";
import { listEvents } from "@/lib/embed-db/repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const encoder = new TextEncoder();

export async function GET(request: Request) {
  let tokenPayload;

  try {
    tokenPayload = requireEmbedToken(request);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 },
    );
  }

  let isClosed = false;
  let client: ReturnType<typeof createPostgresClient> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (eventName: string, data: unknown) => {
        if (isClosed) return;
        controller.enqueue(
          encoder.encode(
            `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`,
          ),
        );
      };

      const sendSnapshot = async () => {
        if (isClosed) return;

        try {
          send("events-snapshot", await listEvents(tokenPayload.clientId));
        } catch (error) {
          send("stream-error", {
            error:
              error instanceof Error ? error.message : "Failed to load events",
          });
        }
      };

      const connect = async () => {
        client = createPostgresClient();
        await client.connect();
        await client.query("listen embed_events_changed");
        client.on("notification", (message) => {
          if (!message.payload) return;

          try {
            const payload = JSON.parse(message.payload);
            const eventClientId = payload?.event?.client_id;

            if (eventClientId !== tokenPayload.clientId) return;

            send("event-change", payload);
          } catch (error) {
            send("stream-error", {
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to parse event notification",
            });
          }
        });
        send("connected", { ok: true });
        await sendSnapshot();
      };

      connect().catch((error) => {
        send("stream-error", {
          error:
            error instanceof Error ? error.message : "Failed to open stream",
        });
      });
    },
    cancel() {
      isClosed = true;
      client?.query("unlisten embed_events_changed").finally(() => {
        client?.end();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
    },
  });
}
