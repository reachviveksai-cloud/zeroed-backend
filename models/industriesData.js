const mongoose = require('mongoose')

const industriesDataSchema = new mongoose.Schema(
    {
        industriesData: {
            type: [Array],
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
)

module.exports = IndustriesData = mongoose.model('IndustriesData', industriesDataSchema, 'IndustriesData')
