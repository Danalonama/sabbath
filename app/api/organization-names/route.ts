import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const ids = Array.from(
    new Set(
      (searchParams.get("ids") || "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );

  if (ids.length === 0) {
    return NextResponse.json({ organizations: {} });
  }

  const client = await clerkClient();
  const entries = await Promise.all(
    ids.map(async (organizationId) => {
      try {
        const organization = await client.organizations.getOrganization({
          organizationId,
        });
        return [organizationId, organization.name] as const;
      } catch {
        return [organizationId, organizationId] as const;
      }
    }),
  );

  return NextResponse.json({ organizations: Object.fromEntries(entries) });
}
