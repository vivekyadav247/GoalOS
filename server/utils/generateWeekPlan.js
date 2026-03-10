const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const normalizeTask = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

const generateWeekPlan = (pattern, config = {}) => {
  const normalizedPattern = String(pattern || '').toUpperCase();

  if (normalizedPattern === 'CUSTOM') {
    const customDays = config.customDays && typeof config.customDays === 'object'
      ? config.customDays
      : {};

    return DAYS.reduce((acc, day) => {
      acc[day] = normalizeTask(customDays[day]);
      return acc;
    }, {});
  }

  if (normalizedPattern === 'WEEKDAY_WEEKEND') {
    const weekdayTask = normalizeTask(config.weekdayTask);
    const weekendTask = normalizeTask(config.weekendTask);

    return DAYS.reduce((acc, day, index) => {
      acc[day] = index < 5 ? weekdayTask : weekendTask;
      return acc;
    }, {});
  }

  if (normalizedPattern === 'MON_SAT') {
    const commonTask = normalizeTask(config.task);
    const sundayTask = normalizeTask(config.sundayTask);

    return DAYS.reduce((acc, day, index) => {
      acc[day] = index < 6 ? commonTask : sundayTask;
      return acc;
    }, {});
  }

  const fallbackTask = normalizeTask(config.task);

  return DAYS.reduce((acc, day) => {
    acc[day] = fallbackTask;
    return acc;
  }, {});
};

module.exports = { generateWeekPlan, DAYS };
