const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require("../models/User");

exports.sendMessage = async (req, res) => {
    const {chatId, receiver, text} = req.body;
    const sender = req.user.id;

    try {
        const newMessage = new Message({chatId, sender, receiver, text});
        await newMessage.save();

        await Chat.findByIdAndUpdate(chatId, {lastMessage: newMessage._id});

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.broadcastMessage = async (req, res) => {
    const {text} = req.body;
    const senderId = req.user.id;
    try {
        const users = await User.find({_id: {$ne: senderId}});

        for (let user of users) {
            let chat = await Chat.findOne({participants: {$all: [senderId, user._id]}});

            if (!chat) {
                chat = new Chat({participants: [senderId, user._id]});
                await chat.save();
            }

            const message = new Message({chatId: chat._id, sender: senderId, receiver: user._id, text});
            await message.save();
        }

        res.json({message: "Broadcast sent to all users!"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.getMessages = async (req, res) => {
    const {chatId} = req.params;
    try {
        const messages = await Message.find({chatId})
            .populate("chatId")
            .populate("sender", "userName email")
            .populate("receiver", "userName email")
            .sort({createdAt: 1});

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

const getDateTimeKey = (date) => {
    const local = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
    const yyyyMMdd = local.toISOString().split("T")[0];
    const hhmm = local.toTimeString().split(":").slice(0, 2).join(":");
    return `${yyyyMMdd}_${hhmm}`;
};


exports.getBroadcastMessages = async (req, res) => {
    const adminId = req.user.id;
    try {
        const messages = await Message.find({ sender: adminId })
            .populate("sender")
            .populate("chatId")
            .populate("receiver", "userName email");
        const uniqueMessages = [];
        const messageSet = new Set();

        const normalizeText = (str) =>
            str.normalize("NFKD").replace(/\s+/g, " ").trim().toLowerCase();

        messages.forEach((msg) => {
            const dateOnly = getDateTimeKey(new Date(msg.createdAt));
            const text = normalizeText(msg.text || "");
            const key = `${text}_${dateOnly}`;

            if (!messageSet.has(key)) {
                messageSet.add(key);
                uniqueMessages.push(msg);
            }
        });

        res.status(200).json(uniqueMessages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

