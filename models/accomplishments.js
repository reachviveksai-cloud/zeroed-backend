const mongoose = require('mongoose')

const accomplishmentsSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accomplishment_1: { type: String },
    accomplishment_2: { type: String },
    accomplishment_3: { type: String },
    accomplishment_4: { type: String },
    accomplishment_5: { type: String },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

module.exports = Accomplishments = mongoose.model(
  'accomplishments',
  accomplishmentsSchema,
  'accomplishments',
)
