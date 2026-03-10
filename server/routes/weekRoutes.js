const express = require('express');
const { createWeek, getWeeksByMonth, applyWeekPattern } = require('../controllers/weekController');

const router = express.Router();

router.post('/', createWeek);
router.post('/pattern', applyWeekPattern);
router.get('/:monthId', getWeeksByMonth);

module.exports = router;

