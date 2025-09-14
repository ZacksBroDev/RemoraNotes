import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch,
  Alert
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ListRow } from '../components/ListRow';
import { getSettings, updateSettings } from '../data/db';

export const SettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    showClientsTab: false,
    notificationsEnabled: true,
    defaultReminderDays: 7
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSettingChange = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await updateSettings(newSettings);
      
      if (key === 'showClientsTab') {
        Alert.alert(
          'Setting Updated',
          value ? 'Clients tab will be shown' : 'Clients tab will be hidden',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    section: {
      marginTop: 32,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: theme.colors.text,
      marginHorizontal: 16,
      marginBottom: 8,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    settingInfo: {
      flex: 1,
      marginRight: 16,
    },
    settingTitle: {
      fontSize: 17,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 15,
      color: theme.colors.textSecondary,
    },
    aboutSection: {
      marginTop: 40,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    appName: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    version: {
      fontSize: 15,
      color: theme.colors.textSecondary,
    },
    description: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interface</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Show Clients Tab</Text>
            <Text style={styles.settingDescription}>
              Display a separate tab for business clients and professional contacts
            </Text>
          </View>
          <Switch
            value={settings.showClientsTab}
            onValueChange={(value) => handleSettingChange('showClientsTab', value)}
            trackColor={{ 
              false: theme.colors.border, 
              true: theme.colors.primary + '40' 
            }}
            thumbColor={settings.showClientsTab ? theme.colors.primary : theme.colors.surface}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Enable Reminders</Text>
            <Text style={styles.settingDescription}>
              Get notifications for birthdays and follow-ups
            </Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) => handleSettingChange('notificationsEnabled', value)}
            trackColor={{ 
              false: theme.colors.border, 
              true: theme.colors.primary + '40' 
            }}
            thumbColor={settings.notificationsEnabled ? theme.colors.primary : theme.colors.surface}
          />
        </View>
      </View>

      <View style={styles.aboutSection}>
        <Text style={styles.appName}>RemoraNotes</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.description}>
          🧠 ADHD-friendly relationship management{'\n'}
          Keep track of birthdays, notes, and follow-ups for the people who matter most
        </Text>
      </View>
    </ScrollView>
  );
};
