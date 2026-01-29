const express = require("express");
const { createChat, getAllChats} = require("../../controller/chatController");

const chatRouter = express.Router();

chatRouter.get("/all-chats",  getAllChats);
chatRouter.post("/create",  createChat);


module.exports = chatRouter;