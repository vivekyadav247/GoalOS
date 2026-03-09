const WeekPlan = require('../models/WeekPlan');
const Task = require('../models/Task');
const { updateMonthProgressFromTasks } = require('./monthController');

const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

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
};

