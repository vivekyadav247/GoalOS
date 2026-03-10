const mongoose = require('mongoose');
const Task = require('../models/Task');
const Goal = require('../models/Goal');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { goalId, title, date } = req.body;
    const clerkId = req.auth && req.auth.userId;

    if (!clerkId) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    if (!goalId || !title || !date) {
      return res
        .status(400)
        .json({ message: 'goalId, title and date are required' });
    }

    if (!isValidObjectId(goalId)) {
      return res.status(400).json({ message: 'Invalid goal id' });
    }

    const goal = await Goal.findOne({ _id: goalId, clerkId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date value' });
    }

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (parsedDate < todayStart) {
      return res
        .status(400)
        .json({ message: 'Tasks cannot be created for past dates' });
    }

    const task = await Task.create({
      clerkId,
      goalId,
      title,
      date: parsedDate,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/tasks/goal/:goalId
const getTasksByGoal = async (req, res) => {
  try {
    const clerkId = req.auth && req.auth.userId;

    if (!clerkId) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const { goalId } = req.params;
    const { from, to } = req.query;

    if (!isValidObjectId(goalId)) {
      return res.status(400).json({ message: 'Invalid goal id' });
    }

    const goal = await Goal.findOne({ _id: goalId, clerkId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const query = { goalId, clerkId };

    if (from || to) {
      query.date = {};
      if (from) {
        const fromDate = new Date(from);
        if (!Number.isNaN(fromDate.getTime())) {
          query.date.$gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!Number.isNaN(toDate.getTime())) {
          query.date.$lte = toDate;
        }
      }
    }

    const tasks = await Task.find(query).sort({ date: 1, createdAt: 1 });
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks by goal error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/tasks/today
const getTodayTasks = async (req, res) => {
  try {
    const clerkId = req.auth && req.auth.userId;

    if (!clerkId) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const userGoals = await Goal.find({ clerkId }).select('_id');
    const goalIds = userGoals.map((g) => g._id);

    const tasks = await Task.find({
      clerkId,
      goalId: { $in: goalIds },
      date: { $gte: start, $lt: end },
    }).sort({ createdAt: 1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get today tasks error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/tasks
const getAllTasks = async (req, res) => {
  try {
    const clerkId = req.auth && req.auth.userId;

    if (!clerkId) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const userGoals = await Goal.find({ clerkId }).select('_id');
    const goalIds = userGoals.map((g) => g._id);

    const tasks = await Task.find({ clerkId, goalId: { $in: goalIds } }).sort({
      date: 1,
      createdAt: 1,
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get all tasks error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const clerkId = req.auth && req.auth.userId;

    if (!clerkId) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findOne({ _id: req.params.id, clerkId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.body.title !== undefined) {
      task.title = req.body.title;
    }
    if (req.body.date !== undefined) {
      const nextDate = new Date(req.body.date);
      if (Number.isNaN(nextDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date value' });
      }

      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (nextDate < todayStart) {
        return res
          .status(400)
          .json({ message: 'Tasks cannot be created for past dates' });
      }

      task.date = nextDate;
    }
    if (req.body.completed !== undefined) {
      if (req.body.completed && !task.completed) {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const taskDate = new Date(task.date);
        if (
          Number.isNaN(taskDate.getTime())
          || taskDate < todayStart
          || taskDate >= todayEnd
        ) {
          return res
            .status(400)
            .json({ message: 'Tasks can only be completed on their scheduled date' });
        }
      }

      task.completed = req.body.completed;
    }

    const updatedTask = await task.save();

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const clerkId = req.auth && req.auth.userId;

    if (!clerkId) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findOne({ _id: req.params.id, clerkId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.deleteOne({ _id: task._id });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTask,
  getTasksByGoal,
  getTodayTasks,
  getAllTasks,
  updateTask,
  deleteTask,
};

