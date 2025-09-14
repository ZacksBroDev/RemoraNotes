import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DialInterface } from '../components/DialInterface';
import { useTheme } from '../theme/ThemeContext';

export const DialScreen = ({ navigation }) => {
  const theme = useTheme();

  const dialOptions = [
    { emoji: '📝', label: 'Notes', action: 'notes' },
    { emoji: '✅', label: 'Todo', action: 'todo' },
    { emoji: '❤️', label: 'Faves', action: 'favorites' },
    { emoji: '🏢', label: 'Clients', action: 'clients' },
    { emoji: '📞', label: 'Follow', action: 'followups' },
    { emoji: '🎯', label: 'Goals', action: 'goals' },
  ];

  const handleDialSelection = (option, index) => {
    switch (option.action) {
      case 'notes':
        navigation.navigate('Home', { screen: 'Notes' });
        break;
      case 'todo':
        navigation.navigate('Todo');
        break;
      case 'favorites':
        navigation.navigate('Home', { screen: 'Favorites' });
        break;
      case 'clients':
        navigation.navigate('Home', { screen: 'Clients' });
        break;
      case 'followups':
        navigation.navigate('Home', { screen: 'Follow-ups' });
        break;
      case 'goals':
        // Future feature
        break;
      default:
        break;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.text,
      opacity: 0.7,
      marginBottom: 40,
      textAlign: 'center',
    },
    dialContainer: {
      marginBottom: 40,
    },
    instructionText: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.6,
      textAlign: 'center',
      marginTop: 30,
      paddingHorizontal: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Quick Access</Text>
        <Text style={styles.subtitle}>Tap any option to navigate instantly</Text>
        
        <View style={styles.dialContainer}>
          <DialInterface
            options={dialOptions}
            onSelect={handleDialSelection}
          />
        </View>
        
        <Text style={styles.instructionText}>
          Use this dial for quick navigation between different sections of RemoraNotes
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};
