const mongoose = require('mongoose')

const BasicDetailsSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        },
        isPrivate: {type: Boolean, default: false},
        firstname: {type: String},
        lastname: {type: String},
        profile_pic: {type: String},
        dob: {type: Date},
        gender: {type: String},
        nationality: {type: String},
        current_country: {type: String},
        current_state: {type: String},
        current_city: {type: String},
        contact_no: {type: String},
        contact_email_id: {type: String},
        job_preferred_location: {type: String},
        video: {type: String},
        secondary_video: {type: String, required: false},
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: false,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: false,
        },
        isDelete: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        slug: {
            type: String,
            unique: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
)

module.exports = BasicDetails = mongoose.model(
    'basicDetails',
    BasicDetailsSchema,
    'basicDetails',
)