export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Liveness probe for the ALB target group.
 *
 * Intentionally dependency-free: it must answer 200 as long as the Next.js
 * server is up, so a transient database or upstream outage does not cause the
 * ALB to kill an otherwise healthy ECS task. Use /api/db/health for a readiness
 * style check that does exercise PostgreSQL.
 */
export async function GET() {
  return Response.json({ ok: true, status: "healthy" }, { status: 200 });
}
