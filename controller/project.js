const sendBadRequestResponse = require('../responses/badRequest')
const sendNotFoundResponse = require('../responses/notFound')
const sendDeleteResponse = require('../responses/deleted')
const Project = require('../models/project')

exports.deleteProject = async (req,res) => {
    const {id} = req.params

    try {
        const deletedProject =await Project.deleteOne({user_id:id})
        if (deletedProject.deletedCount === 0) {
            return sendNotFoundResponse(res, {}, 'Project not found!', []);
        }

        return sendDeleteResponse(res, {}, 'Project deleted successfully!', []);
    }catch (e){
        console.log(e)
        return sendBadRequestResponse(res, {}, 'Error deleting project', []);
    }
}