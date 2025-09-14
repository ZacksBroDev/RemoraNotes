import * as Notifications from "expo-notifications";
import { getBirthdayNotificationDates } from "./birthdays.js";
import { getDueFollowups } from "../data/db.js";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== "granted") {
      throw new Error("Notification permissions not granted");
    }

    return true;
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
};

// Schedule birthday notifications for a person
export const scheduleBirthdayNotifications = async (
  person,
  month,
  day,
  year = null
) => {
  try {
    // Cancel existing notifications for this person
    await cancelBirthdayNotifications(person.id);

    const notificationDates = getBirthdayNotificationDates(month, day, year);
    const scheduledNotifications = [];

    for (const notification of notificationDates) {
      // Only schedule if the notification date is in the future
      if (notification.date > new Date()) {
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: `🎂 ${person.name}`,
            body: notification.message,
            data: {
              type: "birthday",
              personId: person.id,
              notificationType: notification.type,
            },
            categoryIdentifier: "birthday",
          },
          trigger: {
            date: notification.date,
          },
        });

        scheduledNotifications.push({
          identifier,
          date: notification.date,
          type: notification.type,
        });
      }
    }

    console.log(
      `Scheduled ${scheduledNotifications.length} birthday notifications for ${person.name}`
    );
    return scheduledNotifications;
  } catch (error) {
    console.error("Error scheduling birthday notifications:", error);
    return [];
  }
};

// Cancel birthday notifications for a person
export const cancelBirthdayNotifications = async (personId) => {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    const notificationsToCancel = scheduledNotifications.filter(
      (notification) =>
        notification.content.data?.type === "birthday" &&
        notification.content.data?.personId === personId
    );

    for (const notification of notificationsToCancel) {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier
      );
    }

    console.log(
      `Cancelled ${notificationsToCancel.length} birthday notifications for person ${personId}`
    );
  } catch (error) {
    console.error("Error cancelling birthday notifications:", error);
  }
};

// Schedule follow-up notification for a client
export const scheduleFollowupNotification = async (person, dueDate) => {
  try {
    // Cancel existing follow-up notification for this person
    await cancelFollowupNotification(person.id);

    // Only schedule if the due date is in the future
    if (new Date(dueDate) > new Date()) {
      const notificationDate = new Date(dueDate);
      notificationDate.setHours(9, 0, 0, 0); // Set to 9 AM

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `💼 Follow up with ${person.name}`,
          body: person.company
            ? `Time to check in with ${person.name} at ${person.company}`
            : `Time to check in with ${person.name}`,
          data: {
            type: "followup",
            personId: person.id,
          },
          categoryIdentifier: "followup",
        },
        trigger: {
          date: notificationDate,
        },
      });

      console.log(
        `Scheduled follow-up notification for ${person.name} at ${notificationDate}`
      );
      return identifier;
    }
  } catch (error) {
    console.error("Error scheduling follow-up notification:", error);
    return null;
  }
};

// Cancel follow-up notification for a person
export const cancelFollowupNotification = async (personId) => {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    const notificationsToCancel = scheduledNotifications.filter(
      (notification) =>
        notification.content.data?.type === "followup" &&
        notification.content.data?.personId === personId
    );

    for (const notification of notificationsToCancel) {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier
      );
    }

    console.log(
      `Cancelled ${notificationsToCancel.length} follow-up notifications for person ${personId}`
    );
  } catch (error) {
    console.error("Error cancelling follow-up notifications:", error);
  }
};

// Set up notification categories (for iOS action buttons)
export const setupNotificationCategories = async () => {
  try {
    await Notifications.setNotificationCategoryAsync("birthday", [
      {
        identifier: "snooze",
        buttonTitle: "Snooze 1 day",
        options: { opensAppToForeground: false },
      },
      {
        identifier: "mark_done",
        buttonTitle: "Mark Done",
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationCategoryAsync("followup", [
      {
        identifier: "contacted",
        buttonTitle: "Contacted",
        options: { opensAppToForeground: false },
      },
      {
        identifier: "snooze_followup",
        buttonTitle: "Snooze 1 day",
        options: { opensAppToForeground: false },
      },
    ]);

    console.log("Notification categories set up successfully");
  } catch (error) {
    console.error("Error setting up notification categories:", error);
  }
};

// Handle notification responses (when user taps action buttons)
export const handleNotificationResponse = async (response) => {
  const { actionIdentifier, notification } = response;
  const { type, personId } = notification.request.content.data;

  try {
    switch (actionIdentifier) {
      case "snooze":
        // Reschedule birthday notification for tomorrow at 9 AM
        if (type === "birthday") {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(9, 0, 0, 0);

          await Notifications.scheduleNotificationAsync({
            content: notification.request.content,
            trigger: { date: tomorrow },
          });
        }
        break;

      case "snooze_followup":
        // Reschedule follow-up notification for tomorrow at 9 AM
        if (type === "followup") {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(9, 0, 0, 0);

          await Notifications.scheduleNotificationAsync({
            content: notification.request.content,
            trigger: { date: tomorrow },
          });
        }
        break;

      case "mark_done":
        // Don't reschedule - user has handled the birthday
        console.log(`User marked birthday done for person ${personId}`);
        break;

      case "contacted":
        // Could log an interaction here if needed
        console.log(`User marked contacted for person ${personId}`);
        break;

      default:
        // Default tap - just open the app
        break;
    }
  } catch (error) {
    console.error("Error handling notification response:", error);
  }
};

// Get all scheduled notifications (for debugging)
export const getScheduledNotifications = async () => {
  try {
    const notifications =
      await Notifications.getAllScheduledNotificationsAsync();
    return notifications.map((notification) => ({
      identifier: notification.identifier,
      date: notification.trigger.date,
      title: notification.content.title,
      body: notification.content.body,
      data: notification.content.data,
    }));
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
};

// Cancel all notifications
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("All notifications cancelled");
  } catch (error) {
    console.error("Error cancelling all notifications:", error);
  }
};
