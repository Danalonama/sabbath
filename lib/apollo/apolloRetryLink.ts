import { RetryLink } from '@apollo/client/link/retry'

const ApolloRetryLink: RetryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 5000,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: async (error: any, _operation: any) => {
      return error?.extensions?.code !== 'UNAUTHENTICATED'
    },
  },
})

export default ApolloRetryLink
