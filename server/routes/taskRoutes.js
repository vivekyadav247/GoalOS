const express = require('express');
const {
  createTask,
  getTasksByWeek,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createTask);
router.get('/:weekId', getTasksByWeek);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;

