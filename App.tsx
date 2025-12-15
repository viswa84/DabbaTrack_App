import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './src/apollo/client';
import { AppProvider } from './src/context/AppContext';
import { RootNavigator } from './src/navigation';
import { SplashScreen as BrandSplash } from './src/screens/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <AppProvider>
        <SafeAreaProvider>
          <StatusBar style="light" />
          {showSplash ? <BrandSplash /> : <RootNavigator />}
        </SafeAreaProvider>
      </AppProvider>
    </ApolloProvider>
  );
}
