const express = require('express');
const authController = require("../../controller/auth.controller");
const userRouter = express.Router();

userRouter.get('/get-users', authController.getAllUsers);

module.exports = userRouter;
