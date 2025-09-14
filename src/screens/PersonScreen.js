import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { PillButton } from "../components/PillButton";
import { ListRow } from "../components/ListRow";
import {
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  getNotesByPersonId,
  createNote,
  updateNote,
  deleteNote,
  getInteractionsByPersonId,
  createInteraction,
  getFollowupRuleByPersonId,
  createOrUpdateFollowupRule,
} from "../data/db";
import {
  logInteractionAndUpdateFollowup,
  getFollowupCadenceOptions,
  getInteractionChannels,
  formatFollowupStatus,
} from "../logic/followups";
import { formatBirthdayDisplay } from "../logic/birthdays";

const PERSON_COLORS = [
  "#007AFF",
  "#FF2D92",
  "#FF9500",
  "#AF52DE",
  "#5AC8FA",
  "#34C759",
  "#FF3B30",
  "#8E8E93",
];

export const PersonScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { personId, isNew = false, type = "friend" } = route.params || {};

  const [person, setPerson] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [followupRule, setFollowupRule] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Edit mode states
  const [isEditing, setIsEditing] = useState(isNew);
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editType, setEditType] = useState(type);
  const [editColor, setEditColor] = useState(PERSON_COLORS[0]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Interaction states
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [interactionChannel, setInteractionChannel] = useState("");
  const [interactionSummary, setInteractionSummary] = useState("");

  // Follow-up states
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [followupCadence, setFollowupCadence] = useState(30);

  useEffect(() => {
    if (!isNew && personId) {
      loadPersonData();
    } else {
      // Set up new person defaults
      setPerson({
        name: "",
        type: type,
        color_hex: PERSON_COLORS[0],
        company: "",
        role: "",
      });
      setEditName("");
      setEditType(type);
      setEditColor(PERSON_COLORS[0]);
    }
  }, [personId, isNew, type]);

  const loadPersonData = async () => {
    try {
      setLoading(true);

      // Load person
      const personData = await getPersonById(personId);
      if (!personData) {
        Alert.alert("Error", "Person not found.");
        navigation.goBack();
        return;
      }
      setPerson(personData);
      setEditName(personData.name || "");
      setEditCompany(personData.company || "");
      setEditRole(personData.role || "");
      setEditType(personData.type || "friend");
      setEditColor(personData.color_hex || PERSON_COLORS[0]);
      setIsFavorite(personData.is_favorite || false);

      // Load notes
      const notesData = await getNotesByPersonId(personId);
      setNotes(notesData);

      // Load interactions
      const interactionData = await getInteractionsByPersonId(personId);
      setInteractions(interactionData);

      // Load follow-up rule
      const followupData = await getFollowupRuleByPersonId(personId);
      setFollowupRule(followupData);
      if (followupData) {
        setFollowupCadence(followupData.cadence_days);
      }
    } catch (error) {
      console.error("Error loading person data:", error);
      Alert.alert("Error", "Failed to load person data.");
    } finally {
      setLoading(false);
    }
  };

  const savePerson = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Please enter a name.");
      return;
    }

    try {
      setSaving(true);

      const personData = {
        name: editName.trim(),
        type: editType,
        color_hex: editColor,
        company: editCompany.trim() || null,
        role: editRole.trim() || null,
        is_favorite: isFavorite,
      };

      let savedPersonId = personId;

      if (isNew) {
        savedPersonId = await createPerson(personData);
        navigation.setParams({ personId: savedPersonId, isNew: false });
      } else {
        await updatePerson(personId, personData);
      }

      // Save new note if provided
      if (newNoteText.trim()) {
        await createNote(
          savedPersonId,
          newNoteText.trim(),
          newNoteTitle.trim() || null
        );
        setNewNoteText("");
        setNewNoteTitle("");
      }

      setIsEditing(false);
      await loadPersonData(); // Reload to get updated data
    } catch (error) {
      console.error("Error saving person:", error);
      Alert.alert("Error", "Failed to save person.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;

    try {
      await createNote(
        person.id,
        newNoteText.trim(),
        newNoteTitle.trim() || null
      );
      setNewNoteText("");
      setNewNoteTitle("");

      // Reload notes
      const notesData = await getNotesByPersonId(person.id);
      setNotes(notesData);
    } catch (error) {
      console.error("Error adding note:", error);
      Alert.alert("Error", "Failed to add note");
    }
  };

  const handleDeleteNote = async (noteId) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNote(noteId);
            // Reload notes
            const notesData = await getNotesByPersonId(person.id);
            setNotes(notesData);
          } catch (error) {
            console.error("Error deleting note:", error);
            Alert.alert("Error", "Failed to delete note");
          }
        },
      },
    ]);
  };

  const handleDeletePerson = () => {
    Alert.alert(
      "Delete Person",
      `Are you sure you want to delete ${person.name}? This will also delete all notes, interactions, and reminders.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePerson(personId);
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting person:", error);
              Alert.alert("Error", "Failed to delete person.");
            }
          },
        },
      ]
    );
  };

  const logInteraction = async () => {
    if (!interactionChannel) {
      Alert.alert("Error", "Please select an interaction channel.");
      return;
    }

    try {
      await logInteractionAndUpdateFollowup(
        personId,
        interactionChannel,
        interactionSummary.trim() || null
      );

      setShowInteractionForm(false);
      setInteractionChannel("");
      setInteractionSummary("");
      await loadPersonData(); // Reload to show new interaction
    } catch (error) {
      console.error("Error logging interaction:", error);
      Alert.alert("Error", "Failed to log interaction.");
    }
  };

  const setupFollowup = async () => {
    try {
      await createOrUpdateFollowupRule(personId, followupCadence, true);
      setShowFollowupForm(false);
      await loadPersonData(); // Reload to show new follow-up rule
    } catch (error) {
      console.error("Error setting up follow-up:", error);
      Alert.alert("Error", "Failed to set up follow-up.");
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={[styles.colorIndicator, { backgroundColor: editColor }]} />
        <View style={styles.headerText}>
          {isEditing ? (
            <TextInput
              style={[styles.nameInput, { color: theme.colors.text }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter name"
              placeholderTextColor={theme.colors.textTertiary}
              fontSize={24}
              fontWeight="bold"
            />
          ) : (
            <Text style={[styles.name, { color: theme.colors.text }]}>
              {person?.name || "New Person"}
            </Text>
          )}

          {isEditing ? (
            <View style={styles.typeSelector}>
              <PillButton
                title="Friend"
                emoji="👥"
                size="small"
                variant={editType === "friend" ? "primary" : "outline"}
                onPress={() => setEditType("friend")}
                style={styles.typeButton}
              />
              <PillButton
                title="Family"
                emoji="👨‍👩‍👧‍�"
                size="small"
                variant={editType === "family" ? "primary" : "outline"}
                onPress={() => setEditType("family")}
                style={styles.typeButton}
              />
              <PillButton
                title="Client"
                emoji="💼"
                size="small"
                variant={editType === "client" ? "primary" : "outline"}
                onPress={() => setEditType("client")}
                style={styles.typeButton}
              />
            </View>
          ) : (
            <Text style={[styles.type, { color: theme.colors.textSecondary }]}>
              {person?.type === "client"
                ? "💼 Client"
                : person?.type === "family"
                ? "👨‍👩‍👧‍👦 Family"
                : person?.type === "friend"
                ? "👥 Friend"
                : "👤 Personal"}
              {person?.company && ` • ${person.company}`}
              {person?.role && ` • ${person.role}`}
            </Text>
          )}

          {/* Favorite Toggle - always show when editing */}
          {isEditing && (
            <View style={styles.favoriteContainer}>
              <PillButton
                title={
                  isFavorite ? "Remove from Favorites" : "Add to Favorites"
                }
                emoji={isFavorite ? "⭐" : "☆"}
                size="small"
                variant={isFavorite ? "primary" : "outline"}
                onPress={() => setIsFavorite(!isFavorite)}
                style={styles.favoriteButton}
              />
            </View>
          )}
        </View>
      </View>

      {isEditing && (
        <View style={styles.colorPalette}>
          {PERSON_COLORS.map((color) => (
            <PillButton
              key={color}
              title=""
              onPress={() => setEditColor(color)}
              style={[
                styles.colorButton,
                {
                  backgroundColor: color,
                  borderWidth: editColor === color ? 3 : 0,
                  borderColor: theme.colors.text,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );

  const renderCompanyFields = () => {
    if (editType !== "client" || !isEditing) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          💼 Company Info
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            value={editCompany}
            onChangeText={setEditCompany}
            placeholder="Company name"
            placeholderTextColor={theme.colors.textTertiary}
          />
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            value={editRole}
            onChangeText={setEditRole}
            placeholder="Role/Title"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>
      </View>
    );
  };

  const renderNoteSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        📝 Notes
      </Text>

      {/* Existing Notes */}
      {notes.map((note) => (
        <View
          key={note.id}
          style={[styles.noteItem, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.noteHeader}>
            <Text style={[styles.noteTitle, { color: theme.colors.text }]}>
              {note.title}
            </Text>
            <TouchableOpacity onPress={() => handleDeleteNote(note.id)}>
              <Text style={{ color: theme.colors.destructive, fontSize: 16 }}>
                🗑️
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={[styles.noteBody, { color: theme.colors.textSecondary }]}
          >
            {note.body}
          </Text>
          <Text style={[styles.noteDate, { color: theme.colors.textTertiary }]}>
            {new Date(note.updated_at).toLocaleDateString()}
          </Text>
        </View>
      ))}

      {/* Add New Note Form */}
      {isEditing && (
        <View
          style={[
            styles.newNoteForm,
            { backgroundColor: theme.colors.surfaceSecondary },
          ]}
        >
          <TextInput
            style={[
              styles.noteTitleInput,
              {
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            value={newNoteTitle}
            onChangeText={setNewNoteTitle}
            placeholder="Note title (optional)"
            placeholderTextColor={theme.colors.textTertiary}
          />
          <TextInput
            style={[
              styles.noteInput,
              {
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            value={newNoteText}
            onChangeText={setNewNoteText}
            placeholder="Add a note about this person..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
          />
          {(newNoteText.trim() || newNoteTitle.trim()) && (
            <PillButton
              title="Add Note"
              emoji="➕"
              onPress={handleAddNote}
              size="small"
              style={{ marginTop: 8 }}
            />
          )}
        </View>
      )}
    </View>
  );

  const renderInteractionsSection = () => {
    if (person?.type !== "client") return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            💬 Interactions
          </Text>
          <PillButton
            title="Log Contact"
            emoji="➕"
            size="small"
            onPress={() => setShowInteractionForm(true)}
          />
        </View>

        {interactions.length === 0 ? (
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            No interactions logged yet
          </Text>
        ) : (
          interactions
            .slice(0, 5)
            .map((interaction) => (
              <ListRow
                key={interaction.id}
                title={new Date(interaction.happened_at).toLocaleDateString()}
                subtitle={
                  interaction.summary || `Contact via ${interaction.channel}`
                }
                emoji="💬"
              />
            ))
        )}
      </View>
    );
  };

  const renderFollowupSection = () => {
    if (person?.type !== "client") return null;

    const status = followupRule
      ? formatFollowupStatus({ ...person, next_due: followupRule.next_due })
      : null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            ⏰ Follow-up
          </Text>
          <PillButton
            title={followupRule ? "Edit" : "Set Up"}
            emoji="⚙️"
            size="small"
            onPress={() => setShowFollowupForm(true)}
          />
        </View>

        {followupRule ? (
          <ListRow
            title={`Every ${followupRule.cadence_days} days`}
            subtitle={status?.text || "Active"}
            emoji={status?.emoji || "✅"}
            color={status?.color}
          />
        ) : (
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            No follow-up schedule set
          </Text>
        )}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.separator,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    colorIndicator: {
      width: 8,
      height: 60,
      borderRadius: 4,
      marginRight: theme.spacing.md,
    },
    headerText: {
      flex: 1,
    },
    name: {
      ...theme.typography.title1,
      marginBottom: theme.spacing.xs,
    },
    nameInput: {
      ...theme.typography.title1,
      marginBottom: theme.spacing.xs,
      padding: 0,
    },
    type: {
      ...theme.typography.subhead,
    },
    typeSelector: {
      flexDirection: "row",
      marginTop: theme.spacing.xs,
    },
    typeButton: {
      marginRight: theme.spacing.sm,
    },
    colorPalette: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    colorButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    actionButtons: {
      flexDirection: "row",
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.separator,
    },
    actionButton: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
    section: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.separator,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      ...theme.typography.title3,
    },
    inputContainer: {
      gap: theme.spacing.md,
    },
    input: {
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.typography.body,
    },
    noteInput: {
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      minHeight: 100,
      textAlignVertical: "top",
      ...theme.typography.body,
    },
    emptyText: {
      ...theme.typography.body,
      fontStyle: "italic",
      textAlign: "center",
      paddingVertical: theme.spacing.lg,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      width: "90%",
      maxWidth: 400,
    },
    modalTitle: {
      ...theme.typography.title2,
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: theme.spacing.lg,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: theme.spacing.lg,
    },
    modalButton: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
    noteItem: {
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    noteHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.xs,
    },
    noteTitle: {
      ...theme.typography.headline,
      flex: 1,
    },
    noteBody: {
      ...theme.typography.body,
      marginBottom: theme.spacing.xs,
    },
    noteDate: {
      ...theme.typography.caption1,
    },
    newNoteForm: {
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.sm,
    },
    noteTitleInput: {
      borderWidth: 1,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      fontSize: 16,
    },
    label: {
      ...theme.typography.headline,
      marginBottom: theme.spacing.sm,
    },
    cadenceContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    cadenceButton: {
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    favoriteContainer: {
      marginTop: theme.spacing.md,
      alignItems: "center",
    },
    favoriteButton: {
      paddingHorizontal: theme.spacing.lg,
    },
  });

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView>
        {renderHeader()}
        {renderCompanyFields()}
        {renderNoteSection()}
        {renderInteractionsSection()}
        {renderFollowupSection()}
      </ScrollView>

      <View style={styles.actionButtons}>
        {isEditing ? (
          <>
            <PillButton
              title="Cancel"
              variant="outline"
              onPress={() => {
                if (isNew) {
                  navigation.goBack();
                } else {
                  setIsEditing(false);
                  setEditName(person.name);
                  setEditCompany(person.company || "");
                  setEditRole(person.role || "");
                  setEditType(person.type);
                  setEditColor(person.color_hex);
                  setNewNoteText("");
                  setNewNoteTitle("");
                }
              }}
              style={styles.actionButton}
            />
            <PillButton
              title={saving ? "Saving..." : "Save"}
              onPress={savePerson}
              disabled={saving}
              style={styles.actionButton}
            />
          </>
        ) : (
          <>
            <PillButton
              title="Edit"
              emoji="✏️"
              variant="outline"
              onPress={() => setIsEditing(true)}
              style={styles.actionButton}
            />
            <PillButton
              title="Delete"
              emoji="🗑️"
              variant="danger"
              onPress={handleDeletePerson}
              style={styles.actionButton}
            />
          </>
        )}
      </View>

      {/* Interaction Form Modal */}
      <Modal
        visible={showInteractionForm}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInteractionForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Interaction</Text>

            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
              value={interactionChannel}
              onChangeText={setInteractionChannel}
              placeholder="Channel (e.g., Phone, Email, Meeting)"
              placeholderTextColor={theme.colors.textTertiary}
            />

            <TextInput
              style={[
                styles.noteInput,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
              value={interactionSummary}
              onChangeText={setInteractionSummary}
              placeholder="What did you discuss?"
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <PillButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowInteractionForm(false)}
                style={styles.modalButton}
              />
              <PillButton
                title="Save"
                onPress={logInteraction}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Follow-up Setup Modal */}
      <Modal
        visible={showFollowupForm}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFollowupForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Setup Follow-up Reminder</Text>

            <Text style={[styles.label, { color: theme.colors.text }]}>
              Remind me every:
            </Text>

            <View style={styles.cadenceContainer}>
              {[7, 14, 30, 60, 90].map((days) => (
                <PillButton
                  key={days}
                  title={`${days} days`}
                  size="small"
                  variant={followupCadence === days ? "primary" : "outline"}
                  onPress={() => setFollowupCadence(days)}
                  style={styles.cadenceButton}
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <PillButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowFollowupForm(false)}
                style={styles.modalButton}
              />
              <PillButton
                title="Save"
                onPress={setupFollowup}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};
