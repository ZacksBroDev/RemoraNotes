import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { ListRow } from "../components/ListRow";
import { getSettings, updateSettings } from "../data/db";

export const SettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    showClientsTab: false,
    notificationsEnabled: true,
    defaultReminderDays: 7,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleSettingChange = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await updateSettings(newSettings);

      if (key === "showClientsTab") {
        Alert.alert(
          "Setting Updated",
          value ? "Clients tab will be shown" : "Clients tab will be hidden",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      Alert.alert("Error", "Failed to update setting");
    }
  };

  const showTermsAndConditions = () => {
    Alert.alert(
      "Terms & Conditions - Privacy Policy",
      `🔒 Your Privacy is Our Priority

📱 LOCAL STORAGE ONLY
• All your data is stored exclusively on your device
• No information is ever sent to external servers
• No cloud synchronization or data collection
• Your contacts, notes, and personal information never leave your phone

🛡️ DATA SECURITY
• All information remains private and secure
• No user accounts, logins, or registration required
• No analytics, tracking, or data sharing
• Complete offline functionality

✅ SAFE TO USE
• Perfect for sensitive personal and business contacts
• ADHD-friendly without compromising privacy
• Your relationship data stays with you
• Uninstalling the app removes all data

By using RemoraNotes, you agree that:
• You understand all data is stored locally
• You're responsible for your own data backups
• The app operates entirely offline for your privacy

Last updated: September 2025`,
      [{ text: "I Understand", style: "default" }],
      { cancelable: true }
    );
  };

  const showThemePicker = () => {
    const options = ["System Default", "Light Mode", "Dark Mode", "Cancel"];
    const cancelButtonIndex = 3;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: "Choose Theme",
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              theme.setTheme("system");
              break;
            case 1:
              theme.setTheme("light");
              break;
            case 2:
              theme.setTheme("dark");
              break;
          }
        }
      );
    } else {
      Alert.alert("Choose Theme", "Select your preferred theme", [
        { text: "System Default", onPress: () => theme.setTheme("system") },
        { text: "Light Mode", onPress: () => theme.setTheme("light") },
        { text: "Dark Mode", onPress: () => theme.setTheme("dark") },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const getThemeDisplayText = () => {
    switch (theme.themeMode) {
      case "light":
        return "Light Mode";
      case "dark":
        return "Dark Mode";
      case "system":
      default:
        return "System Default";
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
      fontWeight: "600",
      color: theme.colors.text,
      marginHorizontal: 16,
      marginBottom: 8,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
      fontWeight: "500",
      color: theme.colors.text,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 15,
      color: theme.colors.textSecondary,
    },
    settingValue: {
      fontSize: 17,
      color: theme.colors.primary,
      fontWeight: "500",
    },
    aboutSection: {
      marginTop: 40,
      paddingHorizontal: 16,
      alignItems: "center",
    },
    appName: {
      fontSize: 24,
      fontWeight: "600",
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
      textAlign: "center",
      marginTop: 8,
      lineHeight: 20,
    },
    termsButton: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginHorizontal: 16,
      marginTop: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    termsButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.primary,
      textAlign: "center",
    },
    privacyBadge: {
      backgroundColor: theme.colors.primary + "20",
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginTop: 8,
      alignSelf: "center",
    },
    privacyBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.primary,
      textAlign: "center",
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interface</Text>

        <TouchableOpacity style={styles.settingRow} onPress={showThemePicker}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Theme</Text>
            <Text style={styles.settingDescription}>
              Choose between light, dark, or system default theme
            </Text>
          </View>
          <Text style={styles.settingValue}>{getThemeDisplayText()}</Text>
        </TouchableOpacity>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Show Clients Tab</Text>
            <Text style={styles.settingDescription}>
              Display a separate tab for business clients and professional
              contacts
            </Text>
          </View>
          <Switch
            value={settings.showClientsTab}
            onValueChange={(value) =>
              handleSettingChange("showClientsTab", value)
            }
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary + "40",
            }}
            thumbColor={
              settings.showClientsTab
                ? theme.colors.primary
                : theme.colors.surface
            }
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
            onValueChange={(value) =>
              handleSettingChange("notificationsEnabled", value)
            }
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary + "40",
            }}
            thumbColor={
              settings.notificationsEnabled
                ? theme.colors.primary
                : theme.colors.surface
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Terms</Text>

        <TouchableOpacity
          style={styles.termsButton}
          onPress={showTermsAndConditions}
        >
          <Text style={styles.termsButtonText}>📋 View Terms & Conditions</Text>
        </TouchableOpacity>

        <View style={styles.privacyBadge}>
          <Text style={styles.privacyBadgeText}>
            🔒 100% LOCAL STORAGE - NO DATA SENT TO SERVERS
          </Text>
        </View>
      </View>

      <View style={styles.aboutSection}>
        <Text style={styles.appName}>RemoraNotes</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.description}>
          🧠 ADHD-friendly relationship management{"\n"}
          Keep track of birthdays, notes, and follow-ups for the people who
          matter most
        </Text>
      </View>
    </ScrollView>
  );
};
