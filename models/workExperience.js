const mongoose = require('mongoose')

const workExperienceSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // work_experience_year: { type: String },
        work_experience_industry: {type: String},
        verification_token: {
            type: String,
            default: null
        },
        is_experience_verified: {type: Boolean, default: false},
        work_experience_sub_industry: {type: String},
        work_experience_country: {type: String},
        // work_experience_city: { type: String },
        work_experience_job_title: {type: String},
        work_experience_company_name: {type: String},
        reference_email: {type: String, default: null},
        reference_name: {type: String, default: null},
        reference: {type: String, default: null},
        reference_check: {type: Boolean, default: false},
        work_experience_company_website: {type: String},
        experience_start_date: {type: String, default: null},
        experience_end_date: {type: String, default: null},
        isCurrentlyWorking: {type: Boolean, default: false},
        email: {type: String},
        isVerify: {type: Boolean, default: false},
        verificationName: {type: String},
        verificationDesignation: {type: String},
        verificationFeedback: {type: String},
        verificationToken: {type: String, required: false},
        accomplishments_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'accomplishments',
            required: false,
        },
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
    },
    {
        timestamps: true,
        versionKey: false,
    },
)

module.exports = WorkExperience = mongoose.model(
    'WorkExperience',
    workExperienceSchema,
    'WorkExperience',
)