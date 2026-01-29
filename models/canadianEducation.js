const mongoose = require('mongoose')

const canadianEducationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isCanadianEducation: { type: Boolean, default: false },
    university: { type: String },
    city: { type: String },
    level_of_education_canadian: { type: String },
    field_of_study_canadian: { type: String },
    year_of_completion: { type: String },
    gpa: { type: String },
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

module.exports = CanadianEducation = mongoose.model(
  'canadianEducation',
  canadianEducationSchema,
  'canadianEducation',
)
