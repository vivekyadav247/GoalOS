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

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const goal = await Goal.create({
      title,
      category,
      description,
      startDate,
      endDate,
      userId: req.user._id,
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
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
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
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
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

