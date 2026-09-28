import { apiLog as log } from "@/lib/log/logger-config";
import { SingularClientLog } from "@/types";
import { NextResponse } from "next/server";

export default async function backendLog(logData: SingularClientLog) {
  let { severity, message, user, org, meta } = logData;

  const email =
    typeof user === "string"
      ? user
      : typeof user === "object" && user?.email
      ? user.email
      : null;
  if (email) {
    message = `${email ? "User '" + email + "'" : ""} ${message}`;
  }

  try {
    const entry = log.entry(
      { resource: { type: "global" }, severity: severity },
      { message, user, org, ENV: process.env.ENV, ...meta }
    );
    await log.write(entry);
    return NextResponse.json({ message: "Log entry created" });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error creating log entry", error: error.message },
      { status: 500 }
    );
  }
}
