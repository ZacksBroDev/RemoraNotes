# RemoraNotes

An iOS-first React Native app built with Expo for managing personal memory and lightweight CRM needs.

## Features

- **Local-first**: All data stored locally with expo-sqlite
- **Birthday Reminders**: Import from iOS Contacts with 14/7/1 day notifications
- **Client Follow-ups**: Simple CRM with customizable cadence rules
- **ADHD-friendly UI**: Large buttons, calm spacing, emoji cues
- **System Theme**: Automatically follows iOS light/dark mode

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npx expo start
   ```

3. Scan the QR code with the Expo Go app on your iPhone

## Project Structure

```
├── App.js                 # Main app component
├── src/
│   ├── screens/           # Screen components
│   │   ├── HomeScreen.js
│   │   ├── ImportScreen.js
│   │   └── PersonScreen.js
│   ├── data/
│   │   └── db.js          # SQLite database operations
│   ├── logic/             # Business logic
│   │   ├── birthdays.js
│   │   ├── reminders.js
│   │   └── followups.js
│   ├── components/        # Reusable UI components
│   │   ├── SegmentedControl.js
│   │   ├── ListRow.js
│   │   └── PillButton.js
│   └── theme/
│       └── ThemeContext.js
```

## Database Schema

- **people**: Store contacts (personal/client), company info, colors
- **events**: Birthday information linked to people
- **notes**: One editable note per person
- **interactions**: Log of client communications
- **followup_rules**: Automated follow-up cadence settings

## Privacy

- 100% local storage (no backend)
- No analytics or tracking
- No ads
- Contacts only accessed with explicit permission

## iOS Features

- Contacts integration (expo-contacts)
- Local notifications (expo-notifications)
- System theme support
- Notification action buttons (Snooze, Mark Done)

## License

MIT
