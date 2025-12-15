import { NavigationContainer, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { TodayScreen } from '../screens/Customer/TodayScreen';
import { CalendarScreen } from '../screens/Customer/CalendarScreen';
import { BillingScreen } from '../screens/Customer/BillingScreen';
import { ProfileScreen } from '../screens/Customer/ProfileScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { useAppContext } from '../context/AppContext';
import { DashboardScreen } from '../screens/Admin/DashboardScreen';
import { CustomersScreen } from '../screens/Admin/CustomersScreen';
import { AdminBillingScreen } from '../screens/Admin/AdminBillingScreen';
import { SettingsScreen } from '../screens/Admin/SettingsScreen';

const navTheme: Theme = {
  dark: true,
  colors: {
    primary: colors.brandPrimary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.brandSecondary,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
  },
  tabBarActiveTintColor: colors.brandPrimary,
  tabBarInactiveTintColor: colors.textSecondary,
};

const CustomerTabs = () => (
  <Tab.Navigator screenOptions={({ route }) => ({
    ...screenOptions,
    tabBarIcon: ({ color, size }: { color: string; size: number }) => {
      const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
        Today: 'sunny',
        Calendar: 'calendar',
        Billing: 'wallet',
        Profile: 'person',
      };
      return <Ionicons name={iconMap[route.name] || 'ellipse'} color={color} size={size} />;
    },
  })}
  >
    <Tab.Screen name="Today" component={TodayScreen} />
    <Tab.Screen name="Calendar" component={CalendarScreen} />
    <Tab.Screen name="Billing" component={BillingScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator screenOptions={({ route }) => ({
    ...screenOptions,
    tabBarIcon: ({ color, size }: { color: string; size: number }) => {
      const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
        Dashboard: 'speedometer',
        Customers: 'people',
        AdminBilling: 'file-tray-full',
        Settings: 'settings',
      };
      return <Ionicons name={iconMap[route.name] || 'ellipse'} color={color} size={size} />;
    },
  })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Customers" component={CustomersScreen} />
    <Tab.Screen
      name="AdminBilling"
      component={AdminBillingScreen}
      options={{ title: 'Billing' }}
    />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

export const RootNavigator = () => {
  const { isAuthenticated, role } = useAppContext();
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated && <Stack.Screen name="Login" component={LoginScreen} />}
        {isAuthenticated && role === 'CUSTOMER' && <Stack.Screen name="Customer" component={CustomerTabs} />}
        {isAuthenticated && role === 'ADMIN' && <Stack.Screen name="Admin" component={AdminTabs} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
