import { ApolloClient, from } from "@apollo/client";
import { GetToken } from "@clerk/types";
import cache from "./cache";
import getApolloLink from "./apolloLink";
import apolloErrorLink from "./apolloErrorLink";
import ApolloRetryLink from "./apolloRetryLink";

export let apolloClient: ApolloClient<object>;

export async function resetApolloClientStore() {
  await apolloClient.resetStore();
}

export function createApolloClient(getToken: GetToken): ApolloClient<any> {
  const isBrowser = typeof window !== "undefined";
  return new ApolloClient({
    connectToDevTools: isBrowser,
    ssrMode: !isBrowser,
    link: from([apolloErrorLink, ApolloRetryLink, getApolloLink()]),
    cache,
  });
}

// eslint-disable-next-line @typescript-eslint/typedef
export function initializeApollo(
  initialState = {},
  getToken: GetToken
): ApolloClient<any> {
  const _apolloClient = apolloClient ?? createApolloClient(getToken);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();
    // Restore the cache using the data passed from getStaticProps/getServerSideProps
    // combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") {
    return _apolloClient;
  }
  // Create the Apollo Client once in the client
  if (!apolloClient) {
    apolloClient = _apolloClient;
  }

  return _apolloClient;
}
