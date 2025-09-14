import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { PillButton } from "../components/PillButton";
import { ListRow } from "../components/ListRow";
import {
  getTodosForTomorrow,
  createTodo,
  toggleTodoComplete,
  deleteTodo,
} from "../data/todos";

export const TodoScreen = ({ navigation }) => {
  const theme = useTheme();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDescription, setNewTodoDescription] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState("medium");

  const loadTodos = async () => {
    try {
      setLoading(true);
      const tomorrowTodos = await getTodosForTomorrow();
      setTodos(tomorrowTodos);
    } catch (error) {
      console.error("Error loading todos:", error);
      Alert.alert("Error", "Failed to load todos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) {
      Alert.alert("Error", "Please enter a todo title.");
      return;
    }

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await createTodo({
        title: newTodoTitle.trim(),
        description: newTodoDescription.trim() || null,
        dueDate: tomorrow.toISOString(),
        priority: newTodoPriority,
      });

      setNewTodoTitle("");
      setNewTodoDescription("");
      setNewTodoPriority("medium");
      setShowAddModal(false);
      loadTodos();
    } catch (error) {
      console.error("Error adding todo:", error);
      Alert.alert("Error", "Failed to add todo.");
    }
  };

  const handleToggleComplete = async (todoId) => {
    try {
      await toggleTodoComplete(todoId);
      loadTodos();
    } catch (error) {
      console.error("Error toggling todo:", error);
      Alert.alert("Error", "Failed to update todo.");
    }
  };

  const handleDeleteTodo = async (todoId) => {
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTodo(todoId);
            loadTodos();
          } catch (error) {
            console.error("Error deleting todo:", error);
            Alert.alert("Error", "Failed to delete todo.");
          }
        },
      },
    ]);
  };

  const getPriorityEmoji = (priority) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#FF3B30";
      case "medium":
        return "#FF9500";
      case "low":
        return "#34C759";
      default:
        return theme.colors.textSecondary;
    }
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
    addButton: {
      padding: theme.spacing.sm,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.xxl,
    },
    emptyTitle: {
      ...theme.typography.title1,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
      color: theme.colors.text,
    },
    emptySubtitle: {
      ...theme.typography.body,
      textAlign: "center",
      marginBottom: theme.spacing.xl,
      color: theme.colors.textSecondary,
    },
    todoItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
    },
    todoContent: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    todoTitle: {
      ...theme.typography.headline,
      color: theme.colors.text,
    },
    todoTitleCompleted: {
      textDecorationLine: "line-through",
      opacity: 0.6,
    },
    todoDescription: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    priorityIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: theme.spacing.sm,
    },
    deleteButton: {
      padding: theme.spacing.sm,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      width: "90%",
      maxWidth: 400,
    },
    modalTitle: {
      ...theme.typography.title1,
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
      textAlign: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.card,
    },
    inputMultiline: {
      height: 80,
      textAlignVertical: "top",
    },
    prioritySelector: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: theme.spacing.lg,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    modalButton: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>📋 Tomorrow's Todos</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={{ fontSize: 24 }}>➕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {todos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>🎯 No todos for tomorrow</Text>
            <Text style={styles.emptySubtitle}>
              Add some tasks to stay organized and productive
            </Text>
            <PillButton
              title="Add Todo"
              emoji="➕"
              onPress={() => setShowAddModal(true)}
            />
          </View>
        ) : (
          todos.map((todo) => (
            <View key={todo.id} style={styles.todoItem}>
              <TouchableOpacity onPress={() => handleToggleComplete(todo.id)}>
                <Text style={{ fontSize: 20 }}>
                  {todo.completed ? "✅" : "⭕"}
                </Text>
              </TouchableOpacity>

              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityColor(todo.priority) },
                ]}
              />

              <View style={styles.todoContent}>
                <Text
                  style={[
                    styles.todoTitle,
                    todo.completed && styles.todoTitleCompleted,
                  ]}
                >
                  {todo.title}
                </Text>
                {todo.description && (
                  <Text style={styles.todoDescription}>{todo.description}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteTodo(todo.id)}
              >
                <Text style={{ fontSize: 16, color: theme.colors.destructive }}>
                  🗑️
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Todo</Text>

            <TextInput
              style={styles.input}
              placeholder="Todo title"
              placeholderTextColor={theme.colors.textSecondary}
              value={newTodoTitle}
              onChangeText={setNewTodoTitle}
            />

            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Description (optional)"
              placeholderTextColor={theme.colors.textSecondary}
              value={newTodoDescription}
              onChangeText={setNewTodoDescription}
              multiline
            />

            <View style={styles.prioritySelector}>
              <PillButton
                title="Low"
                emoji="🟢"
                size="small"
                variant={newTodoPriority === "low" ? "primary" : "outline"}
                onPress={() => setNewTodoPriority("low")}
              />
              <PillButton
                title="Medium"
                emoji="🟡"
                size="small"
                variant={newTodoPriority === "medium" ? "primary" : "outline"}
                onPress={() => setNewTodoPriority("medium")}
              />
              <PillButton
                title="High"
                emoji="🔴"
                size="small"
                variant={newTodoPriority === "high" ? "primary" : "outline"}
                onPress={() => setNewTodoPriority("high")}
              />
            </View>

            <View style={styles.modalButtons}>
              <PillButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowAddModal(false)}
                style={styles.modalButton}
              />
              <PillButton
                title="Add Todo"
                emoji="➕"
                onPress={handleAddTodo}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
