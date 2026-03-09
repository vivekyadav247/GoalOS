const express = require('express');
const { createMonth, getMonthsByGoal } = require('../controllers/monthController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createMonth);
router.get('/:goalId', getMonthsByGoal);

module.exports = router;

