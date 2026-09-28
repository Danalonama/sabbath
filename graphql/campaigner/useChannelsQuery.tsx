"use client";

import { gql, useQuery } from "@apollo/client";
import QUERY from "../gql/campaigner/getChannelsQuery.graphql";
import CHANNEL_FRAGMENT from "../gql/campaigner/channelFragment.graphql";
import { Channel, QueryReturn } from "@/types/campaigns/campaigns";

export const GET_CHANNELS_QUERY = gql`
  ${QUERY}
  ${CHANNEL_FRAGMENT}
`;

export interface ReturnedUseChannelsQuery extends QueryReturn {
  channels: Channel[];
}

export const useChannelsQuery = (): ReturnedUseChannelsQuery => {
  const query = useQuery(GET_CHANNELS_QUERY);
  return { loading: query.loading, channels: query.data?.channels };
};
