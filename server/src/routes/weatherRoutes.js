const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weatherController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

// Protected weather route
router.get('/', verifyFirebaseToken, getWeather);

module.exports = router;
