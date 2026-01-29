const InternationalEducation = require('../models/InternationalEducation')
const sendOkResponse = require('../responses/ok')
const sendBadRequestResponse = require('../responses/badRequest')
const sendCreatedRequestResponse = require('../responses/created')
const sendServerErrorResponse = require('../responses/serverError')
const sendNotFoundResponse = require('../responses/notFound')
const sendDeleteResponse = require('../responses/deleted')

// Add InternationalEducation
exports.addEducation = async (req, res) => {
  const {
    user_id,
    level_of_education,
    field_of_study,
    year_of_graduation,
    college_name,
    global_gpa,
    credential_no,
    credential_institute_name,
    credential_assesed
  } = req.body

  try {
    const newData = new InternationalEducation({
      user_id,
      level_of_education,
      field_of_study,
      year_of_graduation,
      college_name,
      global_gpa,
      credential_no,
      credential_institute_name,
      credential_assesed
    })
    
    await newData.save()
    return sendCreatedRequestResponse(
      res,
      {},
      'International Education created successfully!',
      [],
    )
  } catch (error) {
    return sendBadRequestResponse(res, {}, 'Error', error.message)
  }
}
exports.deleteEducation = async (req,res) => {
  const {id} = req.params

  try {
    const deletedEducation =await InternationalEducation.deleteOne({user_id:id})
    if (deletedEducation.deletedCount === 0) {
      return sendNotFoundResponse(res, {}, 'International Education not found!', []);
    }

    return sendDeleteResponse(res, {}, 'International Education deleted successfully!', []);
  }catch (e){
    console.log(e)
    return sendBadRequestResponse(res, {}, 'Error deleting project', []);
  }
}
