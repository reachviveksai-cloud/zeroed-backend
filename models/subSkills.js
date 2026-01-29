const mongoose = require('mongoose')

const SubSkillsSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    core_skill_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoreSkills',
      
    },
    sub_skills: { type: String, },
    certificate: { type: String },
    link: { type: String },
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

module.exports = SubSkills = mongoose.model('SubSkills', SubSkillsSchema, 'SubSkills')
