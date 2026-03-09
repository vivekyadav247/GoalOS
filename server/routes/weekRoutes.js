const express = require('express');
const { createWeek, getWeeksByMonth } = require('../controllers/weekController');

const router = express.Router();

router.post('/', createWeek);
router.get('/:monthId', getWeeksByMonth);

module.exports = router;

