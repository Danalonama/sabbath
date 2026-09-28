import { handleOrganizationAtom, handleUserAtom } from "@/atoms/user-atoms";
import { atom, useAtomValue } from "jotai";
import { log } from "./clientLogger";
import { Organization } from "@clerk/nextjs/server";

type LogType = "FETCH" | "EVENT" | "ERROR";

interface LogMessage {
  type: LogType;
  info: Record<string, any>;
  message: string;
}

const useLog = () => {
  const user = useAtomValue(handleUserAtom);
  const org = useAtomValue(handleOrganizationAtom) as Organization;

  const smallOrg = {
    id: org.id,
    name: org.name,
    slug: org.slug,
    imageUrl: org.imageUrl,
  };

  const commitLog = async (logMessage: LogMessage) => {
    await log({
      severity: "INFO",
      message: logMessage?.message,
      user: user,
      org: smallOrg,
      type: logMessage?.type,
      info: logMessage?.info,
    });
  };

  return { commitLog };
};

const useLogAtom = atom(
  () => {},
  async (get, set, logMessage: LogMessage) => {
    const user = get(handleUserAtom);
    const org = get(handleOrganizationAtom) as Organization;
    const smallOrg = {
      id: org.id,
      name: org.name,
      slug: org.slug,
      imageUrl: org.imageUrl,
    };
    await log({
      severity: "INFO",
      message: logMessage?.message,
      user: user,
      org: smallOrg,
      type: logMessage?.type,
      info: logMessage?.info,
    });
  }
);

export default useLog;
export { useLogAtom };
