"use client";
import { ApolloClient, ApolloProvider } from "@apollo/client";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import { initializeApollo } from "./apolloClient";

export const ApolloWrapperProvider = ({
  children,
  initialApolloState = {},
}: {
  children: React.ReactNode;
  initialApolloState?: {} | ApolloClient<any>;
}) => {
  const { getToken } = useAuth();
  const apolloClient = useMemo(
    () => initializeApollo(initialApolloState, getToken),
    [initialApolloState]
  );
  return <ApolloProvider client={apolloClient} children={children} />;
};
