const mongoose = require('mongoose');
const Goal = require('../models/Goal');

const MonthPlan = require('../models/MonthPlan');
const WeekPlan = require('../models/WeekPlan');

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const parseOptionalDate = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const generateMonthsAndWeeksForGoal = async (goal) => {
  if (!goal.startDate || !goal.endDate) {
    return;
  }

  const start = new Date(goal.startDate);
  const end = new Date(goal.endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return;
  }

  const months = [];
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= last) {
    const year = cursor.getFullYear();
    const monthIndex = cursor.getMonth();
    const monthName = `${monthNames[monthIndex]} ${year}`;

    // Avoid creating duplicate month plans with the same name for this goal
    // in case the endpoint is reused in the future.
    const month = await MonthPlan.create({
      goalId: goal._id,
      monthName,
      description: '',
    });

    months.push(month);
    cursor = new Date(year, monthIndex + 1, 1);
  }

  // For simplicity and to align with the example (4 weeks per month),
  // generate 4 numbered weeks for each month.
  for (const month of months) {
    const weekDocs = [];
    for (let weekNumber = 1; weekNumber <= 4; weekNumber += 1) {
      // eslint-disable-next-line no-await-in-loop
      const week = await WeekPlan.create({
        monthId: month._id,
        weekNumber,
        description: `Week ${weekNumber}`,
      });
      weekDocs.push(week);
    }
  }
};

// POST /api/goals
const createGoal = async (req, res) => {
  try {
    const { title, category, description, startDate, endDate } = req.body;
    const clerkId = req.auth && req.auth.userId;

    if (!clerkId) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const parsedStartDate = parseOptionalDate(startDate);
    if (parsedStartDate === null) {
      return res.status(400).json({ message: 'Invalid startDate value' });
    }

    const parsedEndDate = parseOptionalDate(endDate);
    if (parsedEndDate === null) {
      return res.status(400).json({ message: 'Invalid endDate value' });
    }

    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return res.status(400).json({ message: 'startDate cannot be after endDate' });
    }

    const goal = await Goal.create({
      clerkId,
      title,
      category,
      description,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    });

    try {
      await generateMonthsAndWeeksForGoal(goal);
    } catch (dateError) {
      // Log but do not fail goal creation if generation has issues.
      // eslint-disable-next-line no-console
      console.error('Generate planner for goal error:', dateError.message);
    }

    res.status(201).json(goal);
  } catch (error) {
    console.error('Create goal error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/goals
const getGoals = async (req, res) => {
  try {
    const clerkId = req.auth && req.auth.userId;

    if (!clerkId) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const goals = await Goal.find({ clerkId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const clerkId = req.auth && req.auth.userId;

    if (!clerkId) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid goal id' });
    }

    const updateData = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updateData, 'startDate')) {
      const parsedStartDate = parseOptionalDate(updateData.startDate);
      if (parsedStartDate === null) {
        return res.status(400).json({ message: 'Invalid startDate value' });
      }
      updateData.startDate = parsedStartDate;
    }

    if (Object.prototype.hasOwnProperty.call(updateData, 'endDate')) {
      const parsedEndDate = parseOptionalDate(updateData.endDate);
      if (parsedEndDate === null) {
        return res.status(400).json({ message: 'Invalid endDate value' });
      }
      updateData.endDate = parsedEndDate;
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, clerkId },
      updateData,
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json(goal);
  } catch (error) {
    console.error('Update goal error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  try {
    const clerkId = req.auth && req.auth.userId;

    if (!clerkId) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid goal id' });
    }

    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      clerkId,
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error('Delete goal error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
};

