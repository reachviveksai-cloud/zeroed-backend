const Feed = require('../models/feed');
const { uploadFile } = require("../helpers/uploadFile");

// CREATE Feed
const createFeed = async (req, res) => {
    try {
        const { description, noc_number } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Thumbnail image is required' });
        }

        if (!description || !noc_number) {
            return res.status(400).json({ message: 'Description and NOC Number are required' });
        }

        const thumbnailUrl = await uploadFile(file.buffer);

        const newFeed = new Feed({
            thumbnail: thumbnailUrl,
            description,
            noc_number
        });

        await newFeed.save();

        res.status(201).json({ message: 'Feed created successfully', feed: newFeed });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// GET All Feeds
const getAllFeeds = async (req, res) => {
    try {
        const feeds = await Feed.find().sort({ createdAt: -1 });
        res.status(200).json(feeds);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// GET Single Feed
const getFeedById = async (req, res) => {
    try {
        const feed = await Feed.findById(req.params.id);
        if (!feed) return res.status(404).json({ message: 'Feed not found' });
        res.status(200).json(feed);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// UPDATE Feed
const updateFeed = async (req, res) => {
    try {
        const { description, noc_number, thumbnail } = req.body;
        const file = req.file;

        const updateData = {};
        if (description) updateData.description = description;
        if (noc_number) updateData.noc_number = noc_number;

        if (file) {
            updateData.thumbnail = await uploadFile(file.buffer);
        } else if (thumbnail) {
            updateData.thumbnail = thumbnail;
        }

        const updatedFeed = await Feed.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedFeed) return res.status(404).json({ message: 'Feed not found' });

        res.status(200).json({ message: 'Feed updated successfully', feed: updatedFeed });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};


// DELETE Feed
const deleteFeed = async (req, res) => {
    try {
        const deletedFeed = await Feed.findByIdAndDelete(req.params.id);
        if (!deletedFeed) return res.status(404).json({ message: 'Feed not found' });
        res.status(200).json({ message: 'Feed deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

module.exports = {
    createFeed,
    getAllFeeds,
    getFeedById,
    updateFeed,
    deleteFeed
};
