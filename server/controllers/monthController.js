const MonthPlan = require('../models/MonthPlan');
const WeekPlan = require('../models/WeekPlan');
const Task = require('../models/Task');
const Goal = require('../models/Goal');

const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

const updateGoalProgressFromTasks = async (goalId) => {
  const weeks = await WeekPlan.find({}).where('monthId').in(
    (await MonthPlan.find({ goalId }).select('_id')).map((m) => m._id)
  );
  const weekIds = weeks.map((w) => w._id);

  const tasks = await Task.find({ weekId: { $in: weekIds } });
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  const progress = calculateProgress(completedTasks, totalTasks);

  await Goal.findByIdAndUpdate(goalId, { progress });
};

const updateMonthProgressFromTasks = async (monthId) => {
  const weeks = await WeekPlan.find({ monthId }).select('_id');
  const weekIds = weeks.map((w) => w._id);

  const tasks = await Task.find({ weekId: { $in: weekIds } });
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  const progress = calculateProgress(completedTasks, totalTasks);

  const month = await MonthPlan.findByIdAndUpdate(
    monthId,
    { progress },
    { new: true }
  );

  if (month) {
    await updateGoalProgressFromTasks(month.goalId);
  }
};

// POST /api/months
const createMonth = async (req, res) => {
  try {
    const { goalId, monthName, description } = req.body;

    if (!goalId || !monthName) {
      return res.status(400).json({ message: 'goalId and monthName are required' });
    }

    const month = await MonthPlan.create({
      goalId,
      monthName,
      description,
    });

    res.status(201).json(month);
  } catch (error) {
    console.error('Create month error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/months/:goalId
const getMonthsByGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const months = await MonthPlan.find({ goalId }).sort({ createdAt: 1 });
    res.json(months);
  } catch (error) {
    console.error('Get months error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createMonth,
  getMonthsByGoal,
  updateMonthProgressFromTasks,
  updateGoalProgressFromTasks,
};

