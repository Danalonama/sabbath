import { BasicObject, EncompassingLog, PARTIES, User } from "@/types";
import { log } from "@/lib/log/clientLogger";

export async function fetchApi(
  route: string,
  method: string,
  headers: BasicObject,
  logger?: EncompassingLog,
  body?: BodyInit,
  customApi?: string
) {
  try {
    const response = await fetch(customApi ? customApi : `/api/${route}`, {
      method: method,
      headers: headers,
      body: body,
    });
    if (response.ok) {
      const jsonResponse = await response.json();
      const res = customApi ? jsonResponse : jsonResponse.res;
      if (logger?.ok) {
        log(logger.ok);
      }
      return res;
    } else {
      throw response.statusText;
    }
  } catch (error) {
    if (logger?.error) {
      const { meta } = logger.error;
      let errorMessage = "Unknown Error";
      if (error instanceof Error) errorMessage = error.message;

      log({ ...logger.error, meta: { error: errorMessage, ...meta } });
    }
    return error;
  }
}

export async function fetchLayersData(user?: User, logger?: EncompassingLog) {
  return await fetchApi(
    "layers",
    "GET",
    {
      user: user?.email + "",
    },
    logger
  );
}

export const fetchListData = async (
  filters: BasicObject,
  negateFilters?: string[],
  party?: PARTIES,
  user?: User,
  logger?: EncompassingLog,
  layerFilterList?: BasicObject
) => {
  return await fetchApi(
    "list",
    "POST",
    {
      "Content-Type": "application/json",
      user: user?.email,
    },
    logger,
    JSON.stringify({
      filters: filters,
      negateFilters: negateFilters,
      party: party,
      layerFilterList: layerFilterList,
    })
  );
};

export async function fetchMunicipalData(
  id: string,
  user?: User,
  logger?: EncompassingLog
) {
  return await fetchApi(
    `municipal?municipalId=${id}`,
    "GET",
    {
      user: user?.email + "",
    },
    logger
  );
}

export async function fetchSearch(
  searchValue: string,
  user?: User,
  logger?: EncompassingLog
) {
  return await fetchApi(
    `search?searchTerm=${encodeURIComponent(searchValue)}`,
    "GET",
    {
      user: user?.email + "",
    },
    logger
  );
}
