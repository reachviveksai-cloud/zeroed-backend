const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const authController = require('../../controller/auth.controller');

/***
 * Register/Create user
 */
router.post('/signup', authController.doRegister);

router.post('/verify-otp', authController.verifyOTP);

// router.get('/verify/:token', authController.verifyToken)

router.post('/login', authController.doLogin);

router.post('/forgot-password', authController.forgotPassword);

router.post('/forgot-password-otp-verify', authController.OTPverifyPassword);

router.post('/reset-password', authController.resetPassword);

router.post('/guest-user', authController.createUser);

module.exports = router;