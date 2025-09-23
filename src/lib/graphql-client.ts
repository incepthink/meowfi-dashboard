// GraphQL client configuration for connecting to the indexer
import { GraphQLClient } from 'graphql-request';

// Replace with your actual indexer GraphQL endpoint
const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql';

// Create GraphQL client instance
export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export the endpoint for use in other files
export { GRAPHQL_ENDPOINT };