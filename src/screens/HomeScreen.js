import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../theme/ThemeContext";
import { SegmentedControl } from "../components/SegmentedControl";
import { ListRow } from "../components/ListRow";
import { PillButton } from "../components/PillButton";
import { AlphabeticalScrollView } from "../components/AlphabeticalScrollView";
import {
  getUpcomingBirthdaysWithInfo,
  getBirthdayEmoji,
} from "../logic/birthdays";
import {
  getDueAndOverdueFollowups,
  formatFollowupStatus,
} from "../logic/followups";
import { getPeople, getSettings, updateSettings } from "../data/db";

export const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [dueFollowups, setDueFollowups] = useState([]);
  const [allPeople, setAllPeople] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ showClientsTab: false });
  const [selectedColorFilter, setSelectedColorFilter] = useState(null);
  const [tabs, setTabs] = useState([
    { title: "Friends", emoji: "👥" },
    { title: "Family", emoji: "👨‍👩‍👧‍👦" },
    { title: "Favs", emoji: "⭐" },
    { title: "All", emoji: "📋" },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load settings to determine tabs
      const currentSettings = await getSettings();
      setSettings(currentSettings);

      const dynamicTabs = [
        { title: "Friends", emoji: "👥" },
        { title: "Family", emoji: "👨‍👩‍👧‍👦" },
        { title: "Favorites", emoji: "⭐" },
      ];

      if (currentSettings.showClientsTab) {
        dynamicTabs.push({ title: "Work", emoji: "💼" });
      }

      dynamicTabs.push({ title: "All", emoji: "📋" });
      setTabs(dynamicTabs);

      // Load people
      const people = await getPeople();
      setAllPeople(people);

      // Load upcoming birthdays
      const birthdays = await getUpcomingBirthdaysWithInfo();
      setUpcomingBirthdays(birthdays);

      // Load due follow-ups
      const followups = await getDueAndOverdueFollowups();
      setDueFollowups(followups);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleClientsTab = async () => {
    const newSettings = {
      ...settings,
      showClientsTab: !settings.showClientsTab,
    };
    await updateSettings(newSettings);
    setSettings(newSettings);

    // Update tabs
    const dynamicTabs = [
      { title: "Friends", emoji: "👥" },
      { title: "Family", emoji: "👨‍👩‍👧‍👦" },
      { title: "Favorites", emoji: "⭐" },
    ];

    if (newSettings.showClientsTab) {
      dynamicTabs.push({ title: "Work", emoji: "💼" });
    }

    dynamicTabs.push({ title: "All", emoji: "📋" });
    setTabs(dynamicTabs);

    // Reset selected tab if we're on clients and it's being hidden
    if (selectedTab >= dynamicTabs.length) {
      setSelectedTab(0);
    }
  };

  // Get unique colors from all people
  const getUniqueColors = () => {
    const colors = [...new Set(allPeople.map((person) => person.color_hex))];
    return colors.filter(Boolean);
  };

  // Filter people by selected color
  const getFilteredPeople = (people) => {
    if (!selectedColorFilter) return people;
    return people.filter((person) => person.color_hex === selectedColorFilter);
  };

  const renderColorFilter = () => {
    const colors = getUniqueColors();

    if (colors.length === 0) return null;

    return (
      <View style={styles.colorFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.colorFilterItem,
              !selectedColorFilter && styles.colorFilterItemActive,
            ]}
            onPress={() => setSelectedColorFilter(null)}
          >
            <Text style={styles.colorFilterText}>All</Text>
          </TouchableOpacity>

          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorFilterItem,
                selectedColorFilter === color && styles.colorFilterItemActive,
              ]}
              onPress={() =>
                setSelectedColorFilter(
                  selectedColorFilter === color ? null : color
                )
              }
            >
              <View
                style={[styles.colorFilterCircle, { backgroundColor: color }]}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderFriendsTab = () => {
    const friends = getFilteredPeople(
      allPeople.filter((person) => person.type === "friend")
    );

    if (friends.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            {selectedColorFilter
              ? "👥 No friends with this color"
              : "👥 No friends yet"}
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {selectedColorFilter
              ? "Try selecting a different color filter or clear the filter"
              : "Add friends to keep track of your social connections"}
          </Text>
          {!selectedColorFilter && (
            <>
              <PillButton
                title="Add Friend"
                emoji="➕"
                onPress={() =>
                  navigation.navigate("Person", { isNew: true, type: "friend" })
                }
                style={styles.importButton}
              />
              <PillButton
                title="Import Contacts"
                emoji="📱"
                onPress={() => navigation.navigate("Import")}
                style={[styles.importButton, { marginTop: theme.spacing.md }]}
              />
            </>
          )}
        </View>
      );
    }

    return (
      <View>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          👥 Friends ({friends.length})
        </Text>
        {friends.map((person) => {
          return (
            <ListRow
              key={person.id}
              title={person.name}
              subtitle={person.company || "Friend"}
              emoji="👥"
              color={person.color_hex}
              onPress={() =>
                navigation.navigate("Person", { personId: person.id })
              }
            />
          );
        })}
      </View>
    );
  };

  const renderFamilyTab = () => {
    const family = getFilteredPeople(
      allPeople.filter((person) => person.type === "family")
    );

    if (family.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            {selectedColorFilter
              ? "👨‍👩‍👧‍👦 No family with this color"
              : "👨‍👩‍👧‍👦 No family members yet"}
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {selectedColorFilter
              ? "Try selecting a different color filter or clear the filter"
              : "Add family members to keep track of important relationships"}
          </Text>
          {!selectedColorFilter && (
            <PillButton
              title="Add Family Member"
              emoji="➕"
              onPress={() =>
                navigation.navigate("Person", { isNew: true, type: "family" })
              }
              style={styles.importButton}
            />
          )}
        </View>
      );
    }

    return (
      <View>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          👨‍👩‍👧‍👦 Family ({family.length})
        </Text>
        {family.map((person) => {
          return (
            <ListRow
              key={person.id}
              title={person.name}
              subtitle={person.role || "Family"}
              emoji="👨‍👩‍👧‍👦"
              color={person.color_hex}
              onPress={() =>
                navigation.navigate("Person", { personId: person.id })
              }
            />
          );
        })}
      </View>
    );
  };

  const renderFavoritesTab = () => {
    const favorites = getFilteredPeople(
      allPeople.filter((person) => person.is_favorite)
    );

    if (favorites.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            {selectedColorFilter
              ? "⭐ No favorites with this color"
              : "⭐ No favorites yet"}
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {selectedColorFilter
              ? "Try selecting a different color filter or clear the filter"
              : "Mark people as favorites to keep track of your closest relationships"}
          </Text>
        </View>
      );
    }

    return (
      <View>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          ⭐ Favorites ({favorites.length})
        </Text>
        {favorites.map((person) => {
          const typeEmoji =
            person.type === "client"
              ? "💼"
              : person.type === "family"
              ? "👨‍👩‍👧‍👦"
              : "👥";
          const subtitle = person.company
            ? `${person.company}${person.role ? ` • ${person.role}` : ""}`
            : person.type === "client"
            ? "Client"
            : person.type === "family"
            ? "Family"
            : "Friend";

          return (
            <ListRow
              key={person.id}
              title={person.name}
              subtitle={subtitle}
              emoji={typeEmoji}
              color={person.color_hex}
              onPress={() =>
                navigation.navigate("Person", { personId: person.id })
              }
            />
          );
        })}
      </View>
    );
  };

  const renderClientsTab = () => {
    const clients = getFilteredPeople(
      allPeople.filter((person) => person.type === "client")
    );

    if (clients.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            {selectedColorFilter
              ? "💼 No clients with this color"
              : "💼 No clients yet"}
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {selectedColorFilter
              ? "Try selecting a different color filter or clear the filter"
              : "Add clients to track professional relationships and follow-ups"}
          </Text>
          {!selectedColorFilter && (
            <PillButton
              title="Add Client"
              emoji="➕"
              onPress={() =>
                navigation.navigate("Person", { isNew: true, type: "client" })
              }
              style={styles.importButton}
            />
          )}
        </View>
      );
    }

    return (
      <View>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          💼 Clients ({clients.length})
        </Text>
        {clients.map((client) => {
          const subtitle = client.company
            ? `${client.company}${client.role ? ` • ${client.role}` : ""}`
            : "Client";

          return (
            <ListRow
              key={client.id}
              title={client.name}
              subtitle={subtitle}
              emoji="💼"
              color={client.color_hex}
              onPress={() =>
                navigation.navigate("Person", { personId: client.id })
              }
            />
          );
        })}
      </View>
    );
  };

  const renderAllTab = () => {
    if (allPeople.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            📋 No contacts yet
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Import contacts or add people manually
          </Text>
          <PillButton
            title="Add Person"
            emoji="➕"
            onPress={() =>
              navigation.navigate("Person", { isNew: true, type: "friend" })
            }
            style={styles.importButton}
          />
          <PillButton
            title="Import Contacts"
            emoji="📱"
            onPress={() => navigation.navigate("Import")}
            style={[styles.importButton, { marginTop: theme.spacing.md }]}
          />
        </View>
      );
    }

    // Sort alphabetically by name
    const sortedPeople = [...allPeople].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const renderPerson = (person) => {
      const typeEmoji =
        person.type === "client"
          ? "💼"
          : person.type === "family"
          ? "👨‍👩‍👧‍👦"
          : "👥";
      const subtitle = person.company
        ? `${person.company}${person.role ? ` • ${person.role}` : ""}`
        : person.type === "client"
        ? "Client"
        : person.type === "family"
        ? "Family"
        : "Friend";

      return (
        <ListRow
          key={person.id}
          title={person.name}
          subtitle={subtitle}
          emoji={typeEmoji}
          color={person.color_hex}
          onPress={() => navigation.navigate("Person", { personId: person.id })}
        />
      );
    };

    return (
      <View style={styles.allTabContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          📋 All People ({allPeople.length})
        </Text>
        <AlphabeticalScrollView
          data={sortedPeople}
          renderItem={renderPerson}
          style={styles.alphabeticalList}
        />
      </View>
    );
  };

  const renderContent = () => {
    const currentTab = tabs[selectedTab];
    if (!currentTab) return null;

    switch (currentTab.title) {
      case "Friends":
        return renderFriendsTab();
      case "Family":
        return renderFamilyTab();
      case "Favs":
        return renderFavoritesTab();
      case "Work":
        return renderClientsTab();
      case "All":
        return renderAllTab();
      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.largeTitle,
      color: theme.colors.text,
    },
    settingsButton: {
      padding: theme.spacing.sm,
    },
    settingsEmoji: {
      fontSize: 22,
    },
    headerButtons: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerButton: {
      padding: theme.spacing.sm,
      marginLeft: theme.spacing.xs,
    },
    headerEmoji: {
      fontSize: 22,
    },
    clientsToggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
    },
    clientsToggleText: {
      ...theme.typography.body,
      color: theme.colors.text,
    },
    content: {
      flex: 1,
    },
    sectionTitle: {
      ...theme.typography.title2,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xxl,
    },
    emptyTitle: {
      ...theme.typography.title1,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    emptySubtitle: {
      ...theme.typography.body,
      textAlign: "center",
      marginBottom: theme.spacing.xl,
    },
    importButton: {
      minWidth: 150,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    statusText: {
      ...theme.typography.caption,
      fontWeight: "600",
    },
    allTabContainer: {
      flex: 1,
    },
    alphabeticalList: {
      flex: 1,
      marginTop: theme.spacing.sm,
    },
    colorFilterContainer: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
    },
    colorFilterItem: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.card,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 50,
    },
    colorFilterItemActive: {
      backgroundColor: theme.colors.primary,
    },
    colorFilterText: {
      ...theme.typography.caption,
      color: theme.colors.text,
      fontWeight: "600",
    },
    colorFilterCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>RemoraNotes</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Import")}
              style={styles.headerButton}
            >
              <Text style={styles.headerEmoji}>📱</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Todo")}
              style={styles.headerButton}
            >
              <Text style={styles.headerEmoji}>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Dial")}
              style={styles.headerButton}
            >
              <Text style={styles.headerEmoji}>⚡</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings")}
              style={styles.headerButton}
            >
              <Text style={styles.headerEmoji}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <SegmentedControl
          segments={tabs}
          selectedIndex={selectedTab}
          onSelectionChange={setSelectedTab}
        />

        {renderColorFilter()}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};
