const Task = require('../models/Task');
const WeekPlan = require('../models/WeekPlan');
const { updateWeekProgressFromTasks } = require('./weekController');

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { weekId, title, day, category, priority } = req.body;

    if (!weekId || !title || !day) {
      return res
        .status(400)
        .json({ message: 'weekId, title and day are required' });
    }

    const task = await Task.create({
      weekId,
      title,
      day,
      category,
      priority,
    });

    await updateWeekProgressFromTasks(weekId);

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/tasks/:weekId
const getTasksByWeek = async (req, res) => {
  try {
    const { weekId } = req.params;
    const tasks = await Task.find({ weekId }).sort({ createdAt: 1 });
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const originalWeekId = task.weekId.toString();

    if (req.body.weekId && req.body.weekId !== originalWeekId) {
      task.weekId = req.body.weekId;
    }
    if (req.body.title !== undefined) {
      task.title = req.body.title;
    }
    if (req.body.day !== undefined) {
      task.day = req.body.day;
    }
    if (req.body.category !== undefined) {
      task.category = req.body.category;
    }
    if (req.body.priority !== undefined) {
      task.priority = req.body.priority;
    }
    if (req.body.completed !== undefined) {
      task.completed = req.body.completed;
    }

    const updatedTask = await task.save();

    await updateWeekProgressFromTasks(originalWeekId);
    if (updatedTask.weekId.toString() !== originalWeekId) {
      await updateWeekProgressFromTasks(updatedTask.weekId.toString());
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const weekId = task.weekId.toString();
    await Task.deleteOne({ _id: task._id });

    await updateWeekProgressFromTasks(weekId);

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTask,
  getTasksByWeek,
  updateTask,
  deleteTask,
};

