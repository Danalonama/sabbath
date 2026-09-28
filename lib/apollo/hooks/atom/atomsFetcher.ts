// lib/apollo/hooks/atomsFetcher.ts
import { atom } from "jotai";
import { apolloClient } from "@/lib/apollo/apolloClient";
import { DocumentNode, OperationVariables } from "@apollo/client";

/**
 * Creates a Jotai atom that fetches GraphQL data using Apollo Client.
 */
export function createApolloAtomFetcher<
  TData = any,
  TVariables extends OperationVariables = OperationVariables
>(query: DocumentNode, extractor: (data: TData) => any) {
  return (variables?: TVariables) =>
    atom(async () => {
      const { data } = await apolloClient.query<TData, TVariables>({
        query,
        ...(variables ? { variables } : {}),
        fetchPolicy: "no-cache",
      });

      if (!data) {
        throw new Error("No data returned from server");
      }

      return extractor(data);
    });
}
