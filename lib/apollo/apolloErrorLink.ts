import { onError } from "@apollo/client/link/error";
import { log } from "../log/clientLogger";

const apolloErrorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        const msg = `[GraphQL error]: Message: ${err.message}, Location: ${err.locations}, Path: ${err.path}`;
        console.error(msg);
        log({ message: msg, severity: "ERROR" });
        switch (err?.extensions?.code) {
          case "UNAUTHENTICATED":
            console.warn("User is unauthenticated");
            break;
          default:
            return forward(operation);
        }
      }
    }
    if (networkError) {
      const msg = `[Network error]: ${networkError}`;
      console.error(msg);
      log({ message: msg, severity: "CRITICAL" });
      return forward(operation);
    }
    const msg = `[Apollo error]: ${operation.operationName}`;
    console.warn(msg);
    log({ message: msg, severity: "WARNING" });
    return forward(operation);
  }
);

export default apolloErrorLink;
