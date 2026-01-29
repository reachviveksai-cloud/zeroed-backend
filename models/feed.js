const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
    thumbnail: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    noc_number: {
        type: String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Feed', feedSchema);
