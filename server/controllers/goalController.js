const Goal = require('../models/Goal');

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

