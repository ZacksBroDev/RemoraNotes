import React, { useEffect, useState } from 'react';
import { StatusBar, ActivityIndicator, View, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { initDatabase } from './src/data/db';
import { 
  requestNotificationPermissions,
  setupNotificationCategories,
  handleNotificationResponse
} from './src/logic/reminders';

// Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { ImportScreen } from './src/screens/ImportScreen';
import { PersonScreen } from './src/screens/PersonScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { TodoScreen } from './src/screens/TodoScreen';
import { DialScreen } from './src/screens/DialScreen';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const theme = useTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await initDatabase();
      console.log('Database initialized');

      // Request notification permissions
      const hasPermissions = await requestNotificationPermissions();
      if (hasPermissions) {
        console.log('Notification permissions granted');
        
        // Set up notification categories
        await setupNotificationCategories();
        console.log('Notification categories set up');
        
        // Set up notification response listener
        const subscription = Notifications.addNotificationResponseReceivedListener(
          handleNotificationResponse
        );
        
        // Store subscription for cleanup (but don't return it here)
        // Clean up listener on unmount will be handled separately
      } else {
        console.log('Notification permissions denied');
        Alert.alert(
          'Notifications Disabled',
          'Birthday and follow-up reminders will not work without notification permissions. You can enable them in Settings.',
          [{ text: 'OK' }]
        );
      }

      setIsReady(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsReady(true); // Still set ready even if there's an error
      Alert.alert(
        'Initialization Error',
        'There was a problem starting the app. Please restart and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!isReady) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: theme.colors.background 
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: theme.isDark,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.primary,
        },
      }}
    >
      <StatusBar 
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 17,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            headerShown: false, // HomeScreen has its own header
          }}
        />
        
        <Stack.Screen 
          name="Import" 
          component={ImportScreen}
          options={{
            title: 'Import Contacts',
            headerBackTitle: 'Back',
          }}
        />
        
        <Stack.Screen 
          name="Person" 
          component={PersonScreen}
          options={({ route }) => ({
            title: route.params?.isNew ? 'New Person' : 'Person',
            headerBackTitle: 'Back',
            headerRight: route.params?.isNew ? undefined : () => (
              // Could add share or other actions here
              null
            ),
          })}
        />
        
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            title: 'Settings',
            headerBackTitle: 'Back',
          }}
        />
        
        <Stack.Screen 
          name="Todo" 
          component={TodoScreen}
          options={{
            title: 'Todos',
            headerBackTitle: 'Back',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
