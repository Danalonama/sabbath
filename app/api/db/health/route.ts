import { queryPostgres } from "@/lib/db/postgres";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await queryPostgres<{
      database: string;
      now: string;
    }>("select current_database() as database, now() as now");

    return Response.json({
      ok: true,
      database: result.rows[0]?.database,
      now: result.rows[0]?.now,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not connect to PostgreSQL";

    return Response.json(
      {
        error: "Could not connect to PostgreSQL",
        ...(process.env.NODE_ENV === "production" ? {} : { detail: message }),
        ok: false,
      },
      { status: 500 },
    );
  }
}
