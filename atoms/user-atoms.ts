import { BasicLog, BasicObject, Group, InitialFetchAtom, User } from "@/types";
import { redirect } from "next/navigation";
import { atom } from "jotai";
import {
  noUserLoggedIn,
  userConnectedToMapLog,
} from "@/constants/logConstants";
import { log } from "@/lib/log/clientLogger";
import { atomWithReset, RESET } from "jotai/utils";
import { handleNavigationLinks } from "./navigation-atoms";
import { NavMenuItems } from "@/constants/general";
import { Organization } from "@clerk/nextjs/server";
import { cardTabsAtom, resetAllMapAtoms } from "./map/map-atoms";
import { resetAllMapFilterAtoms } from "./map/map-filter-atoms";
import { GET_LAYERS } from "@/graphql/map/useLayersQuery";
import { gqlQuery } from "@/lib/apollo/hooks/runGqlQuery";
import { assignFillColorToLayer } from "@/lib/mapbox/mapboxHelper";
import {
  getGenericMapFiltersFromMetadata,
  getKalpiLayerConfig,
} from "@/constants/map/kalpi";
import { normalizeGenericMapFilters } from "@/constants/map/generic-filters";
import { getDemsPartyMembersLayerConfig } from "@/constants/map/dems-party-members";
import { GET_GENERIC_MAP_FILTERS_QUERY } from "@/graphql/map/useGenericMapFiltersQuery";

function isGroup(obj: unknown): obj is Group {
  return !!obj && typeof obj === "object" && "name" in obj;
}

// Your existing user atom
const userAtom = atom<User>();

const organizationAtom = atom<Organization | {}>({});

export const accessTokenAtom = atom<string>("");

export const groupAtom = atomWithReset<Group | {}>({});

export const handleUserAtom = atom(
  (get) => get(userAtom),
  (get, set, user: User | undefined, accessToken: string) => {
    if (!user) {
      log(noUserLoggedIn);
      set(handleGroupAtom, RESET);
      redirect("/sign-in");
    }
    if (!user) return;
    const currentUser = get(userAtom);
    set(userAtom, user);
    set(accessTokenAtom, accessToken);
    if (currentUser?.id !== user.id) {
      log(userConnectedToMapLog(user));
    }
  },
);

export const handleOrganizationAtom = atom(
  (get) => get(organizationAtom),
  async (get, set, organization: BasicObject, role?: string) => {
    set(organizationAtom, organization);
    const { publicMetadata } = organization;
    const availableLinks = publicMetadata.availableLinks || [];
    const links = NavMenuItems.filter((link) =>
      link.auth === "all"
        ? true
        : Array.isArray(link.auth) && role && link.auth.includes(role)
          ? availableLinks.includes(link.key)
          : false,
    );
    set(handleNavigationLinks, links);
    set(cardTabsAtom, publicMetadata.availableMapCardTabs || []);
    const user = get(handleUserAtom);
    set(handleGroupAtom, user);
  },
);

export const initialPageDataFetch = atom(
  null,
  (get, set, initialFetchAtoms: InitialFetchAtom[]) => {
    initialFetchAtoms.forEach(async (fetchAtom) => {
      const data = await get(fetchAtom.fetchFunction);
      set(fetchAtom.fetchFunction, data);
    });
  },
);

export const handleGroupAtom = atom(
  (get) => get(groupAtom),
  async (get, set, user: User | typeof RESET) => {
    if (user === RESET) {
      set(groupAtom, RESET);
      return;
    }
    const currentGroup = get(groupAtom);
    const organization = get(organizationAtom) as Organization;

    if (
      !isGroup(currentGroup) ||
      (isGroup(currentGroup) &&
        isGroup(organization) &&
        currentGroup?.name !== organization?.name)
    ) {
      let hasMapAccess = false;
      const availableLinks =
        (organization?.publicMetadata?.availableLinks as string[]) || [];
      if (availableLinks) {
        hasMapAccess = availableLinks.includes("map");
      }

      const res = hasMapAccess ? await gqlQuery(GET_LAYERS) : { layers: [] };
      const kalpiLayerConfig = getKalpiLayerConfig(
        organization?.publicMetadata || {},
        isGroup(organization) ? organization.name : undefined,
      );
      let genericMapFilters = getGenericMapFiltersFromMetadata(
        organization?.publicMetadata || {},
      );

      if (kalpiLayerConfig.enhanced) {
        try {
          const filterConfigData = await gqlQuery<{
            genericMapFilters: BasicObject[];
          }>(
            GET_GENERIC_MAP_FILTERS_QUERY,
            { target: "kalpi" },
            "network-only",
          );
          genericMapFilters = [
            ...genericMapFilters,
            ...normalizeGenericMapFilters(filterConfigData.genericMapFilters),
          ];
        } catch (_error) {}
      }

      const groups = {
        layers: assignFillColorToLayer(res.layers),
        hasSignageAccess: organization?.publicMetadata?.addSignage || false,
        hasDoorToDoorAccess:
          organization?.publicMetadata?.addDoorToDoor || false,
        hasImprovedDoorToDoorAccess:
          organization?.publicMetadata?.addImprovedDoorToDoor ||
          organization?.publicMetadata?.improvedDoorToDoor ||
          organization?.publicMetadata?.enhancedDoorToDoor ||
          false,
        kalpiLayerConfig,
        genericMapFilters,
        demsPartyMembersLayerConfig: getDemsPartyMembersLayerConfig(
          organization?.publicMetadata || {},
        ),
        name: isGroup(organization) ? organization.name : undefined,
      };
      if (groups) {
        set(groupAtom, groups || {});
        resetAllMapAtoms(set);
        resetAllMapFilterAtoms(set);
      } else {
        console.error("No Layers found");
      }
    }
  },
);

export const handleLogAtom = atom(null, async (get, set, logData: BasicLog) => {
  const user = get(userAtom);
  const org = get(organizationAtom);
  await log({ ...logData, user: user, org: org as BasicObject });
});
