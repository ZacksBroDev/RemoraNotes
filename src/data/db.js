// Simple in-memory data store for demo purposes
// In a real app, this would use expo-sqlite properly

let people = [];
let events = [];
let notes = [];
let interactions = [];
let followupRules = [];
let followups = []; // New: Support multiple active follow-ups per person
let settings = {
  showClientsTab: false,
  notificationsEnabled: true,
  defaultReminderDays: 7
};

let nextId = 1;

export const initDatabase = async () => {
  console.log('Database initialized (in-memory for demo)');
  return true;
};

export const getDatabase = () => {
  return true;
};

// Settings functions
export const getSettings = async () => {
  return { ...settings };
};

export const updateSettings = async (newSettings) => {
  settings = { ...settings, ...newSettings };
  return settings;
};

// Person operations
export const createPerson = async (person) => {
  const newPerson = {
    id: nextId++,
    name: person.name,
    contact_id: person.contact_id || null,
    photo_uri: person.photo_uri || null,
    color_hex: person.color_hex || '#007AFF',
    type: person.type || 'friend',
    company: person.company || null,
    role: person.role || null,
    preferred_channel: person.preferred_channel || null,
    priority: person.priority || 1,
    is_favorite: person.is_favorite || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  people.push(newPerson);
  return newPerson.id;
};

export const updatePerson = async (id, updates) => {
  const personIndex = people.findIndex(p => p.id === id);
  if (personIndex !== -1) {
    people[personIndex] = {
      ...people[personIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
  }
};

export const getPeople = async (type = null) => {
  if (type) {
    return people.filter(p => p.type === type).sort((a, b) => a.name.localeCompare(b.name));
  }
  return people.sort((a, b) => a.name.localeCompare(b.name));
};

export const getPersonById = async (id) => {
  // Ensure id is converted to number for comparison
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  return people.find(p => p.id === numericId) || null;
};

export const deletePerson = async (id) => {
  people = people.filter(p => p.id !== id);
  events = events.filter(e => e.person_id !== id);
  notes = notes.filter(n => n.person_id !== id);
  interactions = interactions.filter(i => i.person_id !== id);
  followupRules = followupRules.filter(f => f.person_id !== id);
};

// Event operations
export const createEvent = async (event) => {
  const newEvent = {
    id: nextId++,
    person_id: event.person_id,
    type: event.type,
    month: event.month,
    day: event.day,
    year: event.year || null,
    created_at: new Date().toISOString()
  };
  
  events.push(newEvent);
  return newEvent.id;
};

export const getEventsByPersonId = async (personId) => {
  return events.filter(e => e.person_id === personId);
};

export const getUpcomingBirthdays = async (daysAhead = 30) => {
  const birthdays = events.filter(e => e.type === 'birthday');
  const result = [];
  
  for (const event of birthdays) {
    const person = people.find(p => p.id === event.person_id);
    if (person) {
      result.push({
        ...person,
        month: event.month,
        day: event.day,
        year: event.year
      });
    }
  }
  
  return result;
};

// Note operations
export const createNote = async (personId, body, title = null) => {
  const newNote = {
    id: nextId++,
    person_id: personId,
    title: title || `Note ${new Date().toLocaleDateString()}`,
    body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  notes.push(newNote);
  return newNote.id;
};

export const updateNote = async (noteId, updates) => {
  const index = notes.findIndex(n => n.id === noteId);
  if (index !== -1) {
    notes[index] = {
      ...notes[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return notes[index];
  }
  return null;
};

export const deleteNote = async (noteId) => {
  const index = notes.findIndex(n => n.id === noteId);
  if (index !== -1) {
    return notes.splice(index, 1)[0];
  }
  return null;
};

export const getNotesByPersonId = async (personId) => {
  return notes
    .filter(n => n.person_id === personId)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
};

// Legacy function for backward compatibility
export const getNoteByPersonId = async (personId) => {
  const personNotes = await getNotesByPersonId(personId);
  return personNotes[0] || null;
};

// Legacy function for backward compatibility
export const createOrUpdateNote = async (personId, body) => {
  return await createNote(personId, body);
};

// Interaction operations
export const createInteraction = async (interaction) => {
  const newInteraction = {
    id: nextId++,
    person_id: interaction.person_id,
    happened_at: interaction.happened_at,
    channel: interaction.channel || null,
    summary: interaction.summary || null,
    created_at: new Date().toISOString()
  };
  
  interactions.push(newInteraction);
  return newInteraction.id;
};

export const getInteractionsByPersonId = async (personId) => {
  return interactions
    .filter(i => i.person_id === personId)
    .sort((a, b) => new Date(b.happened_at) - new Date(a.happened_at));
};

export const getLastInteractionByPersonId = async (personId) => {
  const personInteractions = interactions
    .filter(i => i.person_id === personId)
    .sort((a, b) => new Date(b.happened_at) - new Date(a.happened_at));
  
  return personInteractions[0] || null;
};

// Follow-up rule operations
export const createOrUpdateFollowupRule = async (personId, cadenceDays, enabled = true) => {
  const lastInteraction = await getLastInteractionByPersonId(personId);
  const baseDate = lastInteraction ? new Date(lastInteraction.happened_at) : new Date();
  const nextDue = new Date(baseDate);
  nextDue.setDate(nextDue.getDate() + cadenceDays);
  
  const existingIndex = followupRules.findIndex(f => f.person_id === personId);
  
  if (existingIndex !== -1) {
    followupRules[existingIndex] = {
      ...followupRules[existingIndex],
      cadence_days: cadenceDays,
      next_due: nextDue.toISOString(),
      enabled,
      updated_at: new Date().toISOString()
    };
    return followupRules[existingIndex].id;
  } else {
    const newRule = {
      id: nextId++,
      person_id: personId,
      cadence_days: cadenceDays,
      next_due: nextDue.toISOString(),
      enabled,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    followupRules.push(newRule);
    return newRule.id;
  }
};

export const getFollowupRuleByPersonId = async (personId) => {
  return followupRules.find(f => f.person_id === personId) || null;
};

export const getDueFollowups = async () => {
  const now = new Date();
  const dueRules = followupRules.filter(rule => 
    rule.enabled && new Date(rule.next_due) <= now
  );
  
  const result = [];
  for (const rule of dueRules) {
    const person = people.find(p => p.id === rule.person_id);
    if (person) {
      result.push({
        ...person,
        cadence_days: rule.cadence_days,
        next_due: rule.next_due,
        enabled: rule.enabled
      });
    }
  }
  
  return result.sort((a, b) => new Date(a.next_due) - new Date(b.next_due));
};

export const updateFollowupNextDue = async (personId) => {
  const rule = await getFollowupRuleByPersonId(personId);
  
  if (rule) {
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + rule.cadence_days);
    
    const ruleIndex = followupRules.findIndex(f => f.person_id === personId);
    if (ruleIndex !== -1) {
      followupRules[ruleIndex] = {
        ...followupRules[ruleIndex],
        next_due: nextDue.toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }
};

// Multiple Follow-ups functions
export const createFollowup = async (followup) => {
  const newFollowup = {
    id: nextId++,
    person_id: followup.person_id,
    title: followup.title,
    description: followup.description || null,
    due_date: followup.due_date,
    priority: followup.priority || 'medium', // low, medium, high
    status: followup.status || 'pending', // pending, completed, cancelled
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  followups.push(newFollowup);
  return newFollowup.id;
};

export const getFollowupsByPersonId = async (personId) => {
  const numericId = typeof personId === 'string' ? parseInt(personId, 10) : personId;
  return followups.filter(f => f.person_id === numericId);
};

export const updateFollowup = async (id, updates) => {
  const followupIndex = followups.findIndex(f => f.id === id);
  if (followupIndex !== -1) {
    followups[followupIndex] = { 
      ...followups[followupIndex], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    return followups[followupIndex];
  }
  return null;
};

export const deleteFollowup = async (id) => {
  followups = followups.filter(f => f.id !== id);
  return true;
};

export const getAllActiveFollowups = async () => {
  return followups.filter(f => f.status === 'pending');
};

export const getDuePersonalFollowups = async () => {
  const now = new Date();
  return followups.filter(f => 
    f.status === 'pending' && 
    new Date(f.due_date) <= now
  );
};

export const getOverduePersonalFollowups = async () => {
  const now = new Date();
  return followups.filter(f => 
    f.status === 'pending' && 
    new Date(f.due_date) < now
  );
};
