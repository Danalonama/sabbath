import { getToken } from "../clerk/getToken";
import { ApolloLink, HttpLink } from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { setContext } from "@apollo/client/link/context";

function getApolloLink(): ApolloLink {
  const isBrowser = typeof window !== "undefined";
  const authorizationLink = setContext(async (_request, previousContext) => {
    const token = await getToken();

    return {
      headers: {
        ...previousContext.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  });
  /*const batchHttpLink = new BatchHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL, // Server URL (must be absolute)
    credentials: "include",
    fetch: !isBrowser ? fetch : undefined,
  });
  return authorizationLink.concat(batchHttpLink);*/
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    credentials: "include",
    fetch: !isBrowser ? fetch : undefined,
  });
  return authorizationLink.concat(httpLink);
}

export default getApolloLink;
