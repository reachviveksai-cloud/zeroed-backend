const sendBadRequestResponse = require('../responses/badRequest')
const sendServerErrorResponse = require('../responses/serverError')
const sendNotFoundResponse = require('../responses/notFound')
const sendDeleteResponse = require('../responses/deleted')
const workExperience = require('../models/workExperience')
const accomplishments = require('../models/accomplishments')

exports.deleteWorkExperience = async (req, res) => {
  const { id } = req.params; // Extract user ID from request parameters

  try {
    // Find and delete the work experience by user ID
    const resultExperience = await workExperience.deleteOne({ user_id: id }); 
    const resultAccomplishment = await accomplishments.deleteOne({ user_id: id }); 

    if (resultExperience.deletedCount === 0 || resultAccomplishment === 0) {
      return sendNotFoundResponse(res, {}, 'Work experience not found!', []);
    }

    return sendDeleteResponse(res, {}, 'Work experience deleted successfully!', []);
  } catch (error) {
    console.error(error); // Log the error for debugging
    return sendBadRequestResponse(res, {}, 'Error deleting work experience', []);
  }
}
