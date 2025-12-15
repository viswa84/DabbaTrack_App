import { ApolloClient, HttpLink, InMemoryCache, ApolloLink, from } from '@apollo/client';
import { SchemaLink } from '@apollo/client/link/schema';
import Constants from 'expo-constants';
import { schema } from './schema';

const apiUrl = Constants?.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

// Prefer real backend when provided, otherwise fall back to in-memory schema.
const link: ApolloLink = apiUrl
  ? from([
      new HttpLink({
        uri: apiUrl,
      }),
    ])
  : new SchemaLink({ schema });

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
