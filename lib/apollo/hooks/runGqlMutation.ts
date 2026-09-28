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
export async function gqlMutate<
  TData = any,
  TVariables extends OperationVariables = OperationVariables
>(mutation: DocumentNode, variables?: TVariables): Promise<TData> {
  const { data, errors } = await apolloClient.mutate<TData, TVariables>({
    mutation,
    variables,
  });

  if (errors && errors.length) {
    // surface the first error (or combine them—your call)
    throw new ApolloError({ graphQLErrors: errors });
  }
  if (!data) {
    throw new Error("No data returned from GraphQL server");
  }
  return data;
}
