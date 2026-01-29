mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    project_title: {type: String},
    verification_token: {
        type: String,
        default: null
    },
    is_project_verified: {type: Boolean, default: false},
    reference_email: {type: String, default: null},
    reference_name: {type: String, default: null},
    reference: {type: String, default: null},
    reference_check: {type: Boolean, default: false},
    project_description: {type: String},
    project_url: {type: String},
})

module.exports = Projects = mongoose.model('Projects', ProjectSchema, 'Projects')