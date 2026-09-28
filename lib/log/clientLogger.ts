import { SingularClientLog } from "@/types";
import { fetchApi } from "../api";

export const log = async (logger: SingularClientLog) => {
  let { severity, message, user, org, type, info, meta } = logger;

  const email =
    typeof user === "string"
      ? user
      : typeof user === "object" && user?.email
      ? user.email
      : null;
  if (email) {
    message = `${email ? "User '" + email + "'" : ""} ${message}`;
  }
  await fetchApi(
    "log",
    "POST",
    {
      "Content-Type": "application/json",
    },
    undefined,
    JSON.stringify({ severity, message, user, org, type, info, meta })
  );
};
