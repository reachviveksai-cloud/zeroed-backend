const express = require('express');
const {
    getIndustries,
    createIndustry,
    updateIndustry,
    deleteIndustry,
} = require('../../controller/insutriesData');

const industriesRouter = express.Router();

industriesRouter.get('/', getIndustries);
industriesRouter.post('/', createIndustry);
industriesRouter.put('/:id', updateIndustry);
industriesRouter.delete('/:id', deleteIndustry);

module.exports = industriesRouter;
