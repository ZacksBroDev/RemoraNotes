import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { useTheme } from '../theme/ThemeContext';
import { PillButton } from '../components/PillButton';
import { ListRow } from '../components/ListRow';
import { createPerson, createEvent } from '../data/db';
import { scheduleBirthdayNotifications } from '../logic/reminders';

export const ImportScreen = ({ navigation }) => {
  const theme = useTheme();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState(new Set());

  const requestContactsPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant access to contacts to import birthdays.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      Alert.alert('Error', 'Failed to request contacts permission.');
      return false;
    }
  };

  const loadContacts = async () => {
    setLoading(true);
    
    try {
      const hasPermission = await requestContactsPermission();
      if (!hasPermission) return;

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.Birthday,
          Contacts.Fields.ImageAvailable,
          Contacts.Fields.Image
        ],
      });

      // Filter contacts that have birthdays
      const contactsWithBirthdays = data.filter(contact => 
        contact.birthday && 
        contact.name && 
        contact.birthday.month && 
        contact.birthday.day
      );

      setContacts(contactsWithBirthdays);
      
      if (contactsWithBirthdays.length === 0) {
        Alert.alert(
          'No Birthdays Found',
          'No contacts with birthday information were found in your contacts.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleContactSelection = (contactId) => {
    const newSelection = new Set(selectedContacts);
    if (newSelection.has(contactId)) {
      newSelection.delete(contactId);
    } else {
      newSelection.add(contactId);
    }
    setSelectedContacts(newSelection);
  };

  const selectAllContacts = () => {
    const allIds = new Set(contacts.map(contact => contact.id));
    setSelectedContacts(allIds);
  };

  const deselectAllContacts = () => {
    setSelectedContacts(new Set());
  };

  const importSelectedContacts = async () => {
    if (selectedContacts.size === 0) {
      Alert.alert('No Contacts Selected', 'Please select at least one contact to import.');
      return;
    }

    setImporting(true);
    
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const contact of contacts) {
        if (selectedContacts.has(contact.id)) {
          try {
            // Create person record
            const personId = await createPerson({
              name: contact.name,
              contact_id: contact.id,
              photo_uri: contact.imageAvailable ? contact.image?.uri : null,
              type: 'personal'
            });

            // Create birthday event
            await createEvent({
              person_id: personId,
              type: 'birthday',
              month: contact.birthday.month,
              day: contact.birthday.day,
              year: contact.birthday.year || null
            });

            // Schedule birthday notifications
            const person = { id: personId, name: contact.name };
            await scheduleBirthdayNotifications(
              person,
              contact.birthday.month,
              contact.birthday.day,
              contact.birthday.year
            );

            successCount++;
          } catch (error) {
            console.error(`Error importing contact ${contact.name}:`, error);
            errorCount++;
          }
        }
      }

      if (successCount > 0) {
        Alert.alert(
          'Import Complete',
          `Successfully imported ${successCount} contact${successCount === 1 ? '' : 's'}${errorCount > 0 ? `. ${errorCount} failed to import.` : '.'}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Import Failed', 'No contacts were successfully imported.');
      }
    } catch (error) {
      console.error('Error importing contacts:', error);
      Alert.alert('Error', 'Failed to import contacts. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const formatBirthday = (birthday) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const monthName = months[birthday.month - 1];
    return birthday.year 
      ? `${monthName} ${birthday.day}, ${birthday.year}`
      : `${monthName} ${birthday.day}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.largeTitle,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    loadingText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.md,
      textAlign: 'center',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    emptyTitle: {
      ...theme.typography.title1,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    emptySubtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.separator,
    },
    controlButton: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
    contactsList: {
      paddingBottom: theme.spacing.xl,
    },
    selectedIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    unselectedIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.textTertiary,
    },
    bottomActions: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.separator,
    },
    selectedCount: {
      ...theme.typography.callout,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
  });

  const renderContactsList = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading contacts with birthdays...</Text>
        </View>
      );
    }

    if (contacts.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>📱 No Contacts Found</Text>
          <Text style={styles.emptySubtitle}>
            No contacts with birthday information were found. Make sure you have contacts with birthdays in your phone.
          </Text>
          <PillButton
            title="Try Again"
            emoji="🔄"
            onPress={loadContacts}
          />
        </View>
      );
    }

    return (
      <>
        <View style={styles.controlsContainer}>
          <PillButton
            title="Select All"
            size="small"
            variant="outline"
            onPress={selectAllContacts}
            style={styles.controlButton}
          />
          <PillButton
            title="Deselect All"
            size="small"
            variant="outline"
            onPress={deselectAllContacts}
            style={styles.controlButton}
          />
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={styles.contactsList}>
          {contacts.map((contact) => {
            const isSelected = selectedContacts.has(contact.id);
            const birthdayText = formatBirthday(contact.birthday);
            
            return (
              <ListRow
                key={contact.id}
                title={contact.name}
                subtitle={`🎂 ${birthdayText}`}
                onPress={() => toggleContactSelection(contact.id)}
                rightElement={
                  isSelected ? (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedText}>✓</Text>
                    </View>
                  ) : (
                    <View style={styles.unselectedIndicator} />
                  )
                }
              />
            );
          })}
        </ScrollView>
      </>
    );
  };

  useEffect(() => {
    loadContacts();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Import Contacts</Text>
        <Text style={styles.subtitle}>
          Select contacts with birthdays to import into RemoraNotes
        </Text>
      </View>

      {renderContactsList()}

      {contacts.length > 0 && (
        <View style={styles.bottomActions}>
          <Text style={styles.selectedCount}>
            {selectedContacts.size} of {contacts.length} selected
          </Text>
          <PillButton
            title={importing ? "Importing..." : "Import Selected"}
            emoji="📥"
            onPress={importSelectedContacts}
            disabled={importing || selectedContacts.size === 0}
            size="large"
          />
        </View>
      )}
    </View>
  );
};
