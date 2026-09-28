import { apiLogMessage } from "@/lib/log/messageBuilder";
import backendLog from "../log/manage";
import { withApiAuth } from "@/lib/withApiAuth";

export const GET = withApiAuth(async (req: Request, handler) => {
  const { user, org, orgId } = handler;

  if (!orgId) return Response.json({ message: "No active organization" });
  if (org) {
    const metadata = org.privateMetadata;
    const orgName = org.name;
    try {
      backendLog({
        severity: "INFO",
        message: apiLogMessage("GET", "org", orgName),
        user,
        org,
      });
      return Response.json({ res: metadata });
    } catch (error: any) {
      backendLog({
        severity: "ERROR",
        message: apiLogMessage("GET", "org", orgName, true, error.message),
        user,
        org,
      });
      return Response.json({ error: error });
    }
  }
  return Response.json({ message: "Organization not found" });
});
