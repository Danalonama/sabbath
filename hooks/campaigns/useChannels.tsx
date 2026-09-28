import { useChannelsQuery } from "@/graphql/campaigner/useChannelsQuery";
import { createContext, useContext } from "react";
import { Channel } from "types/campaigns/campaigns";

export interface ChannelsContextType {
  loading: boolean;
  channels: Channel[];
}

export const ChannelsContext = createContext<ChannelsContextType>({
  loading: true,
  channels: [],
});

export function useChannelsContext() {
  return useContext(ChannelsContext);
}

export function useChannels() {
  const { loading, channels } = useChannelsQuery();

  return { loading, channels: channels ?? [] };
}
