const express = require('express');
const router = express.Router();
const { syncUser, getMe, updateProfile } = require('../controllers/userController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

// All routes require a valid Firebase ID token
router.post('/sync', verifyFirebaseToken, syncUser);
router.get('/me', verifyFirebaseToken, getMe);
router.put('/profile', verifyFirebaseToken, updateProfile);

module.exports = router;
