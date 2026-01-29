const IndustriesData = require('../models/industriesData');

// @desc   Get all industries data
// @route  GET /api/industries
// @access Public
const getIndustries = async (req, res) => {
    try {
        const industries = await IndustriesData.find();

        // Parse industriesData for each record if it's a string
        const parsedIndustries = JSON.parse(industries[0].industriesData[0]);

        res.status(200).json(parsedIndustries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc   Create new industry data
// @route  POST /api/industries
// @access Public

const createIndustry = async (req, res) => {
    try {
        let { industriesData } = req.body;
        if (typeof industriesData === 'string') {
            try {
                industriesData = JSON.parse(industriesData);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid JSON format for industriesData' });
            }
        }

        if (!industriesData || !Array.isArray(industriesData)) {
            return res.status(400).json({ message: 'Valid industries data is required' });
        }

        const newIndustry = new IndustriesData({
            industriesData: JSON.stringify(industriesData)
        });

        const savedIndustry = await newIndustry.save();
        res.status(201).json(savedIndustry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc   Update industry data
// @route  PUT /api/industries/:id
// @access Public
const updateIndustry = async (req, res) => {
    try {
        let { industriesData } = req.body;

        if (typeof industriesData === 'string') {
            try {
                industriesData = JSON.parse(industriesData);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid JSON format for industriesData' });
            }
        }

        if (!industriesData || !Array.isArray(industriesData)) {
            return res.status(400).json({ message: 'Valid industries data is required' });
        }

        const updatedIndustry = await IndustriesData.findByIdAndUpdate(
            req.params.id,
            { industriesData: JSON.stringify(industriesData) }, // <- Stringify before update
            { new: true, runValidators: true }
        );

        if (!updatedIndustry) return res.status(404).json({ message: 'Industry not found' });

        res.status(200).json(updatedIndustry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc   Delete industry data
// @route  DELETE /api/industries/:id
// @access Public
const deleteIndustry = async (req, res) => {
    try {
        const deletedIndustry = await IndustriesData.findByIdAndDelete(req.params.id);
        if (!deletedIndustry) return res.status(404).json({ message: 'Industry not found' });

        res.status(200).json({ message: 'Industry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getIndustries,
    createIndustry,
    updateIndustry,
    deleteIndustry,
};
