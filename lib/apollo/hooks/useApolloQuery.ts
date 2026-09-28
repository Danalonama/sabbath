"use client";

import {
  DocumentNode,
  OperationVariables,
  QueryHookOptions,
  useQuery,
} from "@apollo/client";

export function useApolloQuery<
  TData = any,
  TVariables extends OperationVariables = OperationVariables
>(query: DocumentNode, options?: QueryHookOptions<TData, TVariables>) {
  const result = useQuery<TData, TVariables>(query, {
    fetchPolicy: "cache-and-network",
    ...options,
  });

  return result;
}
