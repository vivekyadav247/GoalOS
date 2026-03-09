const express = require('express');
const {
  createTask,
  getTasksByGoal,
  getTodayTasks,
  getAllTasks,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.post('/', createTask);
router.get('/', getAllTasks);
router.get('/today', getTodayTasks);
router.get('/goal/:goalId', getTasksByGoal);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;

