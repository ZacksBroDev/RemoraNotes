import { getUpcomingBirthdays } from '../data/db.js';

// Calculate the next birthday occurrence for a person
export const getNextBirthday = (month, day, year = null) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Handle leap day (Feb 29) in non-leap years
  let birthdayMonth = month;
  let birthdayDay = day;
  
  if (month === 2 && day === 29 && !isLeapYear(currentYear)) {
    birthdayDay = 28; // Move to Feb 28 in non-leap years
  }
  
  // Try this year first
  let nextBirthday = new Date(currentYear, birthdayMonth - 1, birthdayDay);
  
  // If birthday has passed this year, use next year
  if (nextBirthday < now) {
    const nextYear = currentYear + 1;
    
    // Check if we need to handle leap day again for next year
    if (month === 2 && day === 29 && !isLeapYear(nextYear)) {
      birthdayDay = 28;
    } else {
      birthdayDay = day; // Reset to original day
    }
    
    nextBirthday = new Date(nextYear, birthdayMonth - 1, birthdayDay);
  }
  
  return nextBirthday;
};

// Check if a year is a leap year
export const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

// Calculate age for a person with a birth year
export const calculateAge = (month, day, year) => {
  if (!year) return null;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  
  let age = currentYear - year;
  
  // If birthday hasn't occurred this year yet, subtract 1
  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age--;
  }
  
  return age;
};

// Get days until next birthday
export const getDaysUntilBirthday = (month, day, year = null) => {
  const nextBirthday = getNextBirthday(month, day, year);
  const now = new Date();
  
  // Calculate difference in days
  const diffTime = nextBirthday - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Get upcoming birthdays with calculated info
export const getUpcomingBirthdaysWithInfo = async (daysAhead = 30) => {
  const birthdays = await getUpcomingBirthdays(daysAhead);
  
  return birthdays.map(person => {
    const daysUntil = getDaysUntilBirthday(person.month, person.day, person.year);
    const age = calculateAge(person.month, person.day, person.year);
    const nextBirthday = getNextBirthday(person.month, person.day, person.year);
    
    return {
      ...person,
      daysUntil,
      age,
      nextBirthday,
      isToday: daysUntil === 0,
      isTomorrow: daysUntil === 1,
      isThisWeek: daysUntil <= 7
    };
  }).sort((a, b) => a.daysUntil - b.daysUntil);
};

// Format birthday display text
export const formatBirthdayDisplay = (month, day, year = null) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthName = monthNames[month - 1];
  
  if (year) {
    return `${monthName} ${day}, ${year}`;
  } else {
    return `${monthName} ${day}`;
  }
};

// Get birthday emoji based on how soon it is
export const getBirthdayEmoji = (daysUntil) => {
  if (daysUntil === 0) return '🎉'; // Today
  if (daysUntil === 1) return '🎂'; // Tomorrow
  if (daysUntil <= 7) return '🎈'; // This week
  if (daysUntil <= 14) return '📅'; // Next two weeks
  return '🗓️'; // Later
};

// Get notification intervals for birthdays (14, 7, 1 days before)
export const getBirthdayNotificationDates = (month, day, year = null) => {
  const nextBirthday = getNextBirthday(month, day, year);
  
  const notifications = [];
  
  // 14 days before
  const twoWeeksBefore = new Date(nextBirthday);
  twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14);
  notifications.push({
    date: twoWeeksBefore,
    type: '14_days',
    message: 'Birthday coming up in 2 weeks'
  });
  
  // 7 days before
  const oneWeekBefore = new Date(nextBirthday);
  oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
  notifications.push({
    date: oneWeekBefore,
    type: '7_days', 
    message: 'Birthday coming up in 1 week'
  });
  
  // 1 day before
  const oneDayBefore = new Date(nextBirthday);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  notifications.push({
    date: oneDayBefore,
    type: '1_day',
    message: 'Birthday is tomorrow!'
  });
  
  // Set all notifications to 9 AM
  notifications.forEach(notification => {
    notification.date.setHours(9, 0, 0, 0);
  });
  
  return notifications;
};
