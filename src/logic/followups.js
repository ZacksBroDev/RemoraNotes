import { 
  getDueFollowups, 
  createInteraction, 
  updateFollowupNextDue,
  getFollowupRuleByPersonId,
  createOrUpdateFollowupRule 
} from '../data/db.js';
import { scheduleFollowupNotification } from './reminders.js';

// Get clients with due or overdue follow-ups
export const getDueAndOverdueFollowups = async () => {
  try {
    const dueFollowups = await getDueFollowups();
    const now = new Date();
    
    return dueFollowups.map(client => {
      const dueDate = new Date(client.next_due);
      const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
      
      return {
        ...client,
        dueDate,
        daysOverdue,
        isOverdue: daysOverdue > 0,
        isDueToday: daysOverdue === 0,
        isDueSoon: daysOverdue >= -3 && daysOverdue < 0 // Due in next 3 days
      };
    }).sort((a, b) => b.daysOverdue - a.daysOverdue); // Most overdue first
  } catch (error) {
    console.error('Error getting due and overdue follow-ups:', error);
    return [];
  }
};

// Log an interaction and update follow-up schedule
export const logInteractionAndUpdateFollowup = async (personId, channel = null, summary = null) => {
  try {
    const now = new Date();
    
    // Log the interaction
    const interactionId = await createInteraction({
      person_id: personId,
      happened_at: now.toISOString(),
      channel,
      summary
    });
    
    // Update the follow-up next due date
    await updateFollowupNextDue(personId);
    
    // Get the updated follow-up rule to schedule a new notification
    const followupRule = await getFollowupRuleByPersonId(personId);
    if (followupRule && followupRule.enabled) {
      // We'll need to get the person data to schedule the notification
      // This would typically be passed in or fetched separately
      console.log(`Updated follow-up for person ${personId}, next due: ${followupRule.next_due}`);
    }
    
    return interactionId;
  } catch (error) {
    console.error('Error logging interaction and updating follow-up:', error);
    throw error;
  }
};

// Set up follow-up cadence for a client
export const setupClientFollowup = async (personId, cadenceDays = 30, enabled = true) => {
  try {
    const ruleId = await createOrUpdateFollowupRule(personId, cadenceDays, enabled);
    
    if (enabled) {
      const followupRule = await getFollowupRuleByPersonId(personId);
      if (followupRule) {
        // Schedule notification (person data would need to be fetched or passed)
        console.log(`Set up follow-up cadence for person ${personId}: every ${cadenceDays} days`);
      }
    }
    
    return ruleId;
  } catch (error) {
    console.error('Error setting up client follow-up:', error);
    throw error;
  }
};

// Get follow-up cadence options
export const getFollowupCadenceOptions = () => {
  return [
    { label: 'Every 2 weeks', value: 14, emoji: '📅' },
    { label: 'Every month', value: 30, emoji: '🗓️' },
    { label: 'Every 2 months', value: 60, emoji: '📆' },
    { label: 'Every quarter', value: 90, emoji: '📋' },
    { label: 'Every 6 months', value: 180, emoji: '📃' },
    { label: 'Custom', value: 'custom', emoji: '⚙️' }
  ];
};

// Get interaction channel options
export const getInteractionChannels = () => {
  return [
    { label: 'Email', value: 'email', emoji: '📧' },
    { label: 'Phone Call', value: 'phone', emoji: '📞' },
    { label: 'Text Message', value: 'sms', emoji: '💬' },
    { label: 'In Person', value: 'in_person', emoji: '🤝' },
    { label: 'Video Call', value: 'video', emoji: '📹' },
    { label: 'Social Media', value: 'social', emoji: '📱' },
    { label: 'Other', value: 'other', emoji: '💼' }
  ];
};

// Format follow-up status for display
export const formatFollowupStatus = (client) => {
  if (!client.next_due) return { text: 'No follow-up set', color: '#666666' };
  
  const dueDate = new Date(client.next_due);
  const now = new Date();
  const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
  
  if (daysOverdue > 0) {
    return {
      text: `${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue`,
      color: '#FF3B30',
      emoji: '🚨'
    };
  } else if (daysOverdue === 0) {
    return {
      text: 'Due today',
      color: '#FF9500',
      emoji: '⚠️'
    };
  } else if (daysOverdue >= -3) {
    const daysUntil = Math.abs(daysOverdue);
    return {
      text: `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`,
      color: '#007AFF',
      emoji: '📅'
    };
  } else {
    const daysUntil = Math.abs(daysOverdue);
    return {
      text: `Due in ${daysUntil} days`,
      color: '#34C759',
      emoji: '✅'
    };
  }
};

// Get suggested interaction summary based on person type and last interaction
export const getSuggestedInteractionSummary = (person, channel) => {
  const suggestions = [];
  
  if (person.type === 'client') {
    if (person.company && person.role) {
      suggestions.push(`Checked in with ${person.name} (${person.role} at ${person.company})`);
    } else {
      suggestions.push(`Checked in with ${person.name}`);
    }
    
    if (channel === 'email') {
      suggestions.push('Sent follow-up email');
      suggestions.push('Discussed project updates');
      suggestions.push('Shared resources and updates');
    } else if (channel === 'phone') {
      suggestions.push('Had a phone check-in');
      suggestions.push('Discussed upcoming projects');
      suggestions.push('Caught up on business matters');
    } else if (channel === 'in_person') {
      suggestions.push('Met in person');
      suggestions.push('Had coffee meeting');
      suggestions.push('Attended networking event together');
    }
  } else {
    suggestions.push(`Caught up with ${person.name}`);
    suggestions.push('Had a good conversation');
    suggestions.push('Checked in to see how they\'re doing');
  }
  
  return suggestions;
};

// Calculate follow-up priority score
export const calculateFollowupPriority = (client) => {
  let score = 0;
  
  // Priority level (1-3, where 3 is highest)
  score += (client.priority || 1) * 10;
  
  // Days overdue (more overdue = higher priority)
  const dueDate = new Date(client.next_due);
  const now = new Date();
  const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
  
  if (daysOverdue > 0) {
    score += daysOverdue * 5; // 5 points per day overdue
  } else if (daysOverdue === 0) {
    score += 15; // Due today gets high priority
  } else if (daysOverdue >= -3) {
    score += 5; // Due soon gets some priority
  }
  
  return score;
};

// Sort clients by follow-up priority
export const sortClientsByPriority = (clients) => {
  return clients.sort((a, b) => {
    const priorityA = calculateFollowupPriority(a);
    const priorityB = calculateFollowupPriority(b);
    return priorityB - priorityA; // Highest priority first
  });
};
