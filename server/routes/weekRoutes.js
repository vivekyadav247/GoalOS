const express = require('express');
const { createWeek, getWeeksByMonth } = require('../controllers/weekController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createWeek);
router.get('/:monthId', getWeeksByMonth);

module.exports = router;

