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
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  parsed.setHours(0, 0, 0, 0);
  const day = parsed.getDay() || 7;
  parsed.setDate(parsed.getDate() - (day - 1));

  return parsed;
};

const toDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
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
      customDays
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

    const payloads = [];

    DAYS.forEach((day, index) => {
      const title = typeof plan[day] === 'string' ? plan[day].trim() : '';
      if (!title) {
        return;
      }

      const date = new Date(start);
      date.setDate(start.getDate() + index);
      date.setHours(0, 0, 0, 0);

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

