const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            default: null
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['ADMIN', 'USER'],
            default: 'USER',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
            required: false,
        },
        resetToken: {type: String},
        resetTokenExpiration: {type: Date},
        isLoggedOut: {
            type: Boolean,
            default: false,
        },
        userToken: {
            type: String,
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

module.exports = User = mongoose.model('user', UserSchema, 'users')
