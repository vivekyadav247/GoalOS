const express = require('express');
const { createMonth, getMonthsByGoal } = require('../controllers/monthController');

const router = express.Router();

router.post('/', createMonth);
router.get('/:goalId', getMonthsByGoal);

module.exports = router;

