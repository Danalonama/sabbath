import { Logging } from "@google-cloud/logging";

const logging = new Logging({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(
    Buffer.from(
      "" + process.env.GOOGLE_CLOUD_LOGGING_KEY_BASE64,
      "base64"
    ).toString()
  ),
});

const clientLog = logging.log("next-client-log");
const apiLog = logging.log("next-api-log");

export { clientLog, apiLog };
