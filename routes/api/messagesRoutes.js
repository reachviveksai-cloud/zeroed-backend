const authMiddleware = require("../../middleware/auth");
const {
    getMessages,
    sendMessage,
    broadcastMessage,
    getBroadcastMessages
} = require("../../controller/messageController");
const isAdmin = require("../../middleware/isAdmin");
const express = require("express");

const messagesRouter = express.Router();

messagesRouter.post("/broadcast", isAdmin,authMiddleware, broadcastMessage);
messagesRouter.get("/broadcast", isAdmin, authMiddleware,getBroadcastMessages);
messagesRouter.post("/send", authMiddleware, sendMessage);
messagesRouter.get("/:chatId", authMiddleware, getMessages);


module.exports = messagesRouter;