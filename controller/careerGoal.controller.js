const CareerGoal = require('../models/careerGoal')
const sendOkResponse = require('../responses/ok')
const sendBadRequestResponse = require('../responses/badRequest')
const sendCreatedRequestResponse = require('../responses/created')
const sendServerErrorResponse = require('../responses/serverError')
const sendNotFoundResponse = require('../responses/notFound')
const sendDeleteResponse = require('../responses/deleted')

// Add CareerGoal
exports.addCareerGoal = async (req, res) => {
  const { user_id, career_role } = req.body;
  try {
    const newData = new CareerGoal({
      user_id,
      career_role,
    })

    await newData.save()
    return sendCreatedRequestResponse(
      res,
      {},
      'Career goal created successfully!',
      [],
    )
  } catch (error) {
    return sendBadRequestResponse(res, {}, 'Error', error.message)
  }
}
