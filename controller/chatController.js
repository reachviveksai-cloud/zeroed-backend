const Chat = require("../models/Chat");

exports.createChat = async (req, res) => {
    const {userId} = req.body;
    const senderId = req.user._id;

    try {
        let chat = await Chat.findOne({participants: {$all: [senderId, userId]}});

        if (!chat) {
            chat = new Chat({participants: [senderId, userId]});
            await chat.save();
        }

        res.status(200).json(chat);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.getAllChats = async (req, res) => {
    const userId = req.user._id.toString();

    try {
        // Step 1: Get chats
        const chats = await Chat.find({ participants: userId })
            .populate({
                path: "participants",
                select: "userName email"
            })
            .populate({
                path: "lastMessage",
                select: "text sender receiver createdAt",
                populate: [
                    { path: "sender", select: "userName email" },
                    { path: "receiver", select: "userName email" },
                ],
            })
            .sort({ updatedAt: -1 });

        const allParticipantIds = new Set();
        chats.forEach(chat => {
            chat.participants.forEach(participant => {
                allParticipantIds.add(participant._id.toString());
            });
        });

        const basicDetailsList = await BasicDetails.find({
            user_id: { $in: Array.from(allParticipantIds) },
            isDelete: false,
        });

        const basicDetailsMap = {};
        basicDetailsList.forEach(detail => {
            basicDetailsMap[detail.user_id.toString()] = detail;
        });

        const enrichedChats = chats.map(chat => {
            const chatObj = chat.toObject();
            chatObj.participants = chatObj.participants
                .filter(p => p._id.toString() !== userId)
                .map(participant => {
                    const idStr = participant._id.toString();
                    return {
                        ...participant,
                        basicDetails: basicDetailsMap[idStr] || null
                    };
                });
            return chatObj;
        });

        res.status(200).json(enrichedChats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
