const mongoose = require('mongoose')

const internationalEducationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    level_of_education: { type: String,},
    field_of_study: { type: String },
    year_of_graduation: { type: String },
      college_name: { type: String },
      global_gpa: { type: String },
      credential_no: { type: String },
      credential_institute_name: { type: String },
      credential_assesed: { type: Boolean },
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

module.exports = InternationalEducation = mongoose.model(
  'internationalEducation',
  internationalEducationSchema,
  'internationalEducation',
)
