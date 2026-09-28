import { NextResponse } from "next/server";
import { clientLog as log } from "@/lib/log/logger-config";

export async function POST(request: any) {
  try {
    const { severity, message, user, org, type, info, meta } =
      await request.json();
    const entry = log.entry(
      { resource: { type: "global" }, severity: severity },
      { message, user, org, type, info, ENV: process.env.ENV, ...meta }
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
