const mongoose = require('mongoose');
const WeekPlan = require('../models/WeekPlan');
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const { updateMonthProgressFromTasks } = require('./monthController');
const { generateWeekPlan, DAYS } = require('../utils/generateWeekPlan');

const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const updateWeekProgressFromTasks = async (weekId) => {
  const tasks = await Task.find({ weekId });
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  const progress = calculateProgress(completedTasks, totalTasks);

  const week = await WeekPlan.findByIdAndUpdate(
    weekId,
    { progress },
    { new: true }
  );

  if (week) {
    await updateMonthProgressFromTasks(week.monthId);
  }
};

const normalizeWeekStart = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    if (Number.isNaN(localDate.getTime())) {
      return null;
    }
    localDate.setHours(0, 0, 0, 0);
    return localDate;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  // Trust the provided weekStart from the client and only
  // normalize the time portion, so we don't accidentally
  // shift into the previous calendar week due to timezone
  // differences or double "start of week" adjustments.
  parsed.setHours(0, 0, 0, 0);

  return parsed;
};

const toDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
};

const normalizeRangeBoundary = (value, isEnd = false) => {
  if (!value) {
    return null;
  }

  let parsed = null;

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    parsed = new Date(year, month - 1, day);
  } else {
    parsed = new Date(value);
  }

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (isEnd) {
    parsed.setHours(23, 59, 59, 999);
  } else {
    parsed.setHours(0, 0, 0, 0);
  }

  return parsed;
};

// POST /api/weeks/pattern
const applyWeekPattern = async (req, res) => {
  try {
    const clerkId = req.auth && req.auth.userId;
    const {
      goalId,
      weekStart,
      pattern,
      task,
      weekdayTask,
      weekendTask,
      sundayTask,
      customDays,
      rangeStart,
      rangeEnd
    } = req.body;

    if (!clerkId) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    if (!goalId || !pattern || !weekStart) {
      return res.status(400).json({ message: 'goalId, weekStart and pattern are required' });
    }

    if (!isValidObjectId(goalId)) {
      return res.status(400).json({ message: 'Invalid goal id' });
    }

    const goal = await Goal.findOne({ _id: goalId, clerkId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    let goalStart = goal.startDate ? new Date(goal.startDate) : null;
    let goalEnd = goal.endDate ? new Date(goal.endDate) : null;

    if (goalStart && Number.isNaN(goalStart.getTime())) {
      goalStart = null;
    }

    if (goalEnd && Number.isNaN(goalEnd.getTime())) {
      goalEnd = null;
    }

    if (goalStart) {
      goalStart.setHours(0, 0, 0, 0);
    }

    if (goalEnd) {
      goalEnd.setHours(23, 59, 59, 999);
    }

    let effectiveStart = goalStart;
    let effectiveEnd = goalEnd;

    const rangeStartDate = normalizeRangeBoundary(rangeStart, false);
    const rangeEndDate = normalizeRangeBoundary(rangeEnd, true);

    if (rangeStartDate) {
      effectiveStart = effectiveStart
        ? new Date(Math.max(effectiveStart.getTime(), rangeStartDate.getTime()))
        : rangeStartDate;
    }

    if (rangeEndDate) {
      effectiveEnd = effectiveEnd
        ? new Date(Math.min(effectiveEnd.getTime(), rangeEndDate.getTime()))
        : rangeEndDate;
    }

    if (effectiveStart && effectiveEnd && effectiveStart > effectiveEnd) {
      return res.status(400).json({ message: 'Selected range is outside the goal timeline' });
    }

    const start = normalizeWeekStart(weekStart);
    if (!start) {
      return res.status(400).json({ message: 'Invalid weekStart value' });
    }

    const plan = generateWeekPlan(pattern, {
      task,
      weekdayTask,
      weekendTask,
      sundayTask,
      customDays
    });

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const existingTasks = await Task.find({
      clerkId,
      goalId,
      date: { $gte: start, $lt: end }
    }).select('title date');

    const existingKeys = new Set(
      existingTasks
        .map((item) => `${toDateKey(item.date)}|${String(item.title || '').toLowerCase()}`)
        .filter(Boolean)
    );

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const payloads = [];

    DAYS.forEach((day, index) => {
      const title = typeof plan[day] === 'string' ? plan[day].trim() : '';
      if (!title) {
        return;
      }

      const date = new Date(start);
      date.setDate(start.getDate() + index);
      date.setHours(0, 0, 0, 0);

      if (date < todayStart) {
        return;
      }

      if (effectiveStart && date < effectiveStart) {
        return;
      }

      if (effectiveEnd && date > effectiveEnd) {
        return;
      }

      const key = `${toDateKey(date)}|${title.toLowerCase()}`;
      if (existingKeys.has(key)) {
        return;
      }

      payloads.push({
        clerkId,
        goalId,
        title,
        date
      });
    });

    const createdTasks = payloads.length > 0 ? await Task.insertMany(payloads) : [];

    res.status(201).json({
      plan,
      created: createdTasks.length
    });
  } catch (error) {
    console.error('Apply weekly pattern error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/weeks
const createWeek = async (req, res) => {
  try {
    const { monthId, weekNumber, description } = req.body;

    if (!monthId || !weekNumber) {
      return res.status(400).json({ message: 'monthId and weekNumber are required' });
    }

    const week = await WeekPlan.create({
      monthId,
      weekNumber,
      description,
    });

    res.status(201).json(week);
  } catch (error) {
    console.error('Create week error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/weeks/:monthId
const getWeeksByMonth = async (req, res) => {
  try {
    const { monthId } = req.params;
    const weeks = await WeekPlan.find({ monthId }).sort({ weekNumber: 1 });
    res.json(weeks);
  } catch (error) {
    console.error('Get weeks error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createWeek,
  getWeeksByMonth,
  updateWeekProgressFromTasks,
  applyWeekPattern,
};

