const BasicDetails = require('../models/BasicDetails')
const sendOkResponse = require('../responses/ok')
const sendBadRequestResponse = require('../responses/badRequest')
const sendCreatedRequestResponse = require('../responses/created')
const sendServerErrorResponse = require('../responses/serverError')
const sendNotFoundResponse = require('../responses/notFound')
const sendDeleteResponse = require('../responses/deleted')
const {uploadFile} = require("../helpers/uploadFile");

// Add BasicDetails
exports.addProfile = async (req, res) => {
    const {
        user_id,
        firstname,
        lastname,
        dob,
        gender,
        nationality,
        current_city,
        contact_no,
        contact_email_id,
        job_preferred_location
    } = req.body
    const file = req.file;
    if (!file) return res.status(400).json({message: 'Profile Pic is required'});
    const profilePicUrl = await uploadFile(file.buffer);

    try {
        const newDetails = new BasicDetails({
            user_id,
            firstname,
            lastname,
            profile_pic: profilePicUrl,
            dob,
            gender,
            nationality,
            current_city,
            contact_no,
            contact_email_id,
            job_preferred_location
        })

        await newDetails.save()
        // res.status(201).send('BasicDetails created successfully!');
        return sendCreatedRequestResponse(
            res,
            {},
            'Basic details created successfully!',
            [],
        )
    } catch (error) {
        // res.status(400).send('Error creating profile: ' + error.message);
        return sendBadRequestResponse(res, {}, 'Error', error.message)
    }
}

// Update BasicDetails
exports.updateProfile = async (req, res) => {
    const {id} = req.params;
    const {firstname, lastname, profile_pic, dob} = req.body;
    const file = req.file;
    try {
        let profilePicUrl = profile_pic;
        if (file) {
            profilePicUrl = await uploadFile(file.buffer);
        }
        const updatedProfile = await BasicDetails.findByIdAndUpdate(
            id,
            {firstname, lastname, profile_pic: profilePicUrl, dob},
            {new: true, runValidators: true}
        );
        if (!updatedProfile) {
            return res.status(404).json({message: 'BasicDetails not found.'});
        }
        return res.status(200).json({message: 'BasicDetails updated successfully!', updatedProfile});
    } catch (error) {
        return res.status(400).json({message: 'Error updating profile', error: error.message});
    }
};


// Delete BasicDetails
exports.deleteProfile = async (req, res) => {
    const {id} = req.params

    try {
        const deletedProfile = await BasicDetails.findByIdAndDelete(id)
        if (!deletedProfile) {
            return res.status(404).send('BasicDetails not found.')
        }

        res.status(200).send('BasicDetails deleted successfully!')
    } catch (error) {
        res.status(400).send('Error deleting profile: ' + error.message)
    }
}

// List Profiles
exports.listProfiles = async (req, res) => {
    try {
        const profiles = await BasicDetails.find().populate('user_id', 'email') // Include user info, modify fields as necessary
        res.status(200).json(profiles)
    } catch (error) {
        res.status(400).send('Error retrieving profiles: ' + error.message)
    }
}
