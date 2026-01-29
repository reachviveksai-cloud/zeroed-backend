const CanadianEducation = require('../models/canadianEducation')
const sendBadRequestResponse = require('../responses/badRequest')
const sendCreatedRequestResponse = require('../responses/created')
const sendNotFoundResponse = require("../responses/notFound");
const sendDeleteResponse = require("../responses/deleted");

// Add Canadian Education
exports.addCanadianDetails = async (req, res) => {
  const {
    user_id,
    university,
    city,
    level_of_education,
    field_of_study,
    year_of_completion,
    gpa
  } = req.body

  try {
    const newData = new CanadianEducation({
      user_id,
      university,
      city,
      level_of_education,
      field_of_study,
      year_of_completion,
      gpa
    })
    
    await newData.save()
    return sendCreatedRequestResponse(
      res,
      {},
      'Canadian education created successfully!',
      [],
    )
  } catch (error) {
    return sendBadRequestResponse(res, {}, 'Error', error.message)
  }
}

exports.deleteCanadianEducation = async (req,res) => {
  const {id} = req.params

  try {
    const deletedCanadianEducation =  await CanadianEducation.deleteOne({user_id:id})
    if (deletedCanadianEducation.deletedCount === 0) {
      return sendNotFoundResponse(res, {}, 'Canadian Education not found!', []);
    }

    return sendDeleteResponse(res, {}, 'Canadian Education deleted successfully!', []);
  }catch (e){
    console.log(e)
    return sendBadRequestResponse(res, {}, 'Error deleting project', []);
  }
}

