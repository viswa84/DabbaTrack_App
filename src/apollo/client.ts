import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApolloClient, HttpLink, InMemoryCache, ApolloLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { SchemaLink } from '@apollo/client/link/schema';
import Constants from 'expo-constants';
import { schema } from './schema';
import { SESSION_STORAGE_KEY } from '../context/AppContext';

const apiUrl = Constants?.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

// Prefer real backend when provided, otherwise fall back to in-memory schema.
const authLink = setContext(async (_, { headers }) => {
  let token: string | undefined;
  try {
    const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token && parsed?.expiresAt > Date.now()) {
        token = parsed.token as string;
      }
    }
  } catch {
    token = undefined;
  }

  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const link: ApolloLink = apiUrl
  ? from([authLink, new HttpLink({ uri: apiUrl })])
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
