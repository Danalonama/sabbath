import { DocumentNode, OperationVariables, ApolloError } from "@apollo/client";
import { apolloClient } from "@/lib/apollo/apolloClient";

/**
 * Fire‑and‑forget GraphQL mutation that feels like `await fetch()`.
 *
 * @example
 * const data = await gqlMutate<CreateTodoMutation, CreateTodoVariables>(
 *   CREATE_TODO_MUTATION,
 *   { text: "Buy milk" }
 * );
 */
export async function gqlQuery<
  TData = any,
  TVariables extends OperationVariables = OperationVariables
>(
  query: DocumentNode,
  variables?: TVariables,
  fetchPolicy: "cache-first" | "network-only" | "no-cache" = "cache-first",
): Promise<TData> {
  const { data, errors } = await apolloClient.query<TData, TVariables>({
    query,
    ...(variables ? { variables } : {}),
    fetchPolicy,
  });

  if (errors && errors.length) {
    // surface the first error (or combine them—your call)
    throw new ApolloError({ graphQLErrors: errors });
  }
  if (!data) {
    throw new Error("No data returned from server");
  }
  return data;
}
