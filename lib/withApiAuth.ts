import {
  auth,
  currentUser,
  clerkClient,
  Organization,
  User,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export function withApiAuth<
  T extends (
    req: Request,
    ctx: { userId: string; orgId?: string; user?: User; org?: Organization }
  ) => Promise<Response>
>(handler: T) {
  return async function (req: Request) {
    // Clerk helper for App Router – returns Auth object  :contentReference[oaicite:0]{index=0}
    const { userId, orgId } = await auth();

    const user = (await currentUser()) || undefined;
    const client = await clerkClient();

    const org = await client.organizations.getOrganization({
      organizationId: orgId!,
    });

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(req, { userId, orgId, user, org });
  };
}
