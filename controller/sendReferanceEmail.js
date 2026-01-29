const nodemailer = require("nodemailer");
const crypto = require("crypto");
const BasicDetails = require('../models/BasicDetails')
const Projects = require('../models/project')
const WorkExperience = require("../models/workExperience");
const config = require("config");

const format = d => new Date(d).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});

const sendExperienceVerificationEmail = async (req, res) => {
    try {
        const {
            referenceEmail,
            candidateName,
            companyName,
            jobTitle,
            accomplishment_1,
            accomplishment_2,
            accomplishment_3,
            accomplishment_4,
            startDate,
            endDate,
            userId,
            workExperienceId
        } = req.body;

        if (!referenceEmail || !candidateName || !companyName || !jobTitle || !startDate || !endDate || !userId || !workExperienceId) {
            return res.status(400).json({message: "All fields are required"});
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");

        await WorkExperience.findOneAndUpdate({
            user_id: userId, _id: workExperienceId
        }, {verification_token: verificationToken}, {new: true, upsert: true});


        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            secure: true,
            auth: {
                user: config.get('appEmail'), pass: config.get('appPassword')
            },
        });

        // const backendUrl = process.env.BACKEND_URL.replace(/\/$/, '');
        const redirectUrl = `https://zeroed-backend.onrender.com/api/work-experience/verify-experience?token=${verificationToken}&userId=${userId}&workExperienceId=${workExperienceId}`;

        let mailOptions = {
            from:  config.get('appEmail'),
            to: referenceEmail,
            subject: "Candidate Work Experience Verification",
            html: `
  <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center">
        <img src="https://res.cloudinary.com/dnxfkmw1x/image/upload/v1742556801/logo.e5f585e18aeaa0222e55_d6ck1v.png" alt="Company Logo" style="max-width: 200px; margin-bottom: 20px;"/>
    </div>

    <h2 style="color: #333;">Candidate Work Experience Verification</h2>

    <p style="font-size: 16px; color: #333;">Dear Employer,</p>
    <p style="font-size: 16px; color: #333;">
        We are verifying the work experience of <strong>${candidateName}</strong> at 
        <strong>${companyName}</strong> as a <strong>${jobTitle}</strong> from 
        <strong>${format(startDate)}</strong> to <strong>${format(endDate)}</strong>.
    </p>

    <h3 style="color: #333; text-align: left;">Accomplishments:</h3>
    <ul style="padding-left: 15px; list-style-type: none; text-align: left; font-size: 17px; color: #333;">
        ${accomplishment_1 ? `<li>• ${accomplishment_1}</li>` : ""}
        ${accomplishment_2 ? `<li>• ${accomplishment_2}</li>` : ""}
        ${accomplishment_3 ? `<li>• ${accomplishment_3}</li>` : ""}
        ${accomplishment_4 ? `<li>• ${accomplishment_4}</li>` : ""}
    </ul>

    <p style="font-size: 16px; color: #333;">Please confirm the authenticity of this information:</p>

    <div style="margin-top: 20px;text-align: center">
        <a href="${redirectUrl}" target="_blank" style="
            background: #00C5FF; 
            color: #fff; 
            padding: 12px 24px; 
            font-size: 16px;
            text-decoration: none; 
            font-weight: bold;
            display: inline-block;
            border-radius: 5px;
            transition: background 0.3s;">
            Verify Now
        </a>
    </div>

    <p style="font-size: 16px; color: #333; margin-top: 20px;">Best Regards,</p>
    <p style="font-size: 16px; font-weight: bold; color: #00C5FF;">Verification Team</p>
</div>
`,

        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({message: "Verification email sent successfully."});
    } catch (error) {
        res.status(500).json({message: "Error sending email", error: error.message});
    }
};

const updateUserVerification = async (req, res) => {
    try {
        const {token, userId, workExperienceId} = req.query;

        if (!token || !userId || !workExperienceId) {
            return res.status(400).send(`
                <div style="text-align: center; padding: 20px;">
                    <h2 style="color: red;">Invalid Request </h2>
                    <p>Missing token or user ID.</p>
                </div>
            `);
        }

        const workExp = await WorkExperience.findOne({user_id: userId, _id: workExperienceId});

        if (!workExp) {
            return res.status(404).send(`
                <div style="text-align: center; padding: 20px;">
                    <h2 style="color: red;">User Not Found </h2>
                    <p>The user does not exist.</p>
                </div>
            `);
        }

        if (workExp.verification_token !== token) {
            return res.status(400).send(`
                <div style="text-align: center; padding: 20px;">
                    <h2 style="color: red;">Invalid Token </h2>
                    <p>The verification token is incorrect.</p>
                </div>
            `);
        }

        workExp.is_experience_verified = true;
        workExp.verification_token = null;
        await workExp.save();

        return res.send(`
    <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f4f7f9;
        font-family: Arial, sans-serif;
    ">
        <div style="
            background: white;
            padding: 40px;
            text-align: center;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 100%;
        ">
            <img src="https://cdn-icons-png.flaticon.com/512/845/845646.png" 
                 alt="Success" 
                 width="100" 
                 style="margin-bottom: 20px;">
            <h1 style="color: #2d8a42; margin-bottom: 10px;">Experience Verified!</h1>
            <p style="color: #555; font-size: 16px;">
                Thank you for verifying your experience. Your confirmation has been recorded successfully.
            </p>
        </div>
    </div>
`);

    } catch (error) {
        res.status(500).send(`
            <div style="text-align: center; padding: 20px;">
                <h2 style="color: red;">Verification Failed </h2>
                <p>Error: ${error.message}</p>
            </div>
        `);
    }
};

const sendProjectVerificationEmail = async (req, res) => {
    try {
        const {
            referenceEmail, project_title, project_description, project_url, userId, projectId
        } = req.body;

        if (!referenceEmail || !project_title || !project_description || !project_url || !userId || !projectId) {
            return res.status(400).json({message: "All fields are required"});
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");

        await Projects.findOneAndUpdate({
            user_id: userId, _id: projectId
        }, {verification_token: verificationToken}, {new: true, upsert: true});

        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            secure: true,
            auth: {
                user: config.get('appEmail'), pass: config.get('appPassword')
            },
        });

        // const backendUrl = process.env.BACKEND_URL.replace(/\/$/, '');
        const redirectUrl = `https://zeroed-backend.onrender.com/api/project/verify-project?token=${verificationToken}&userId=${userId}&projectId=${projectId}`;

        let mailOptions = {
            from: config.get('appEmail'), to: referenceEmail, subject: "Candidate Project Verification", html: `
 <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
 <div style="text-align: center;">
  <img src="https://res.cloudinary.com/dnxfkmw1x/image/upload/v1742556801/logo.e5f585e18aeaa0222e55_d6ck1v.png" alt="Company Logo" style="max-width: 200px; margin-bottom: 20px;" />
</div>

  <h2 style="color: #333;">Project Verification Request</h2>

  <p style="font-size: 16px; color: #333;">Dear Employer,</p>
  <p style="font-size: 16px; color: #333;">
    We are verifying the submitted project details of a candidate for accuracy and authenticity. Below are the details:
  </p>

  <h3 style="color: #333; text-align: left;">Project Information:</h3>
  <ul style="padding: 15px; list-style-type: none; text-align: left; font-size: 16px; color: #333;">
    <li><strong>Project Title:</strong>${project_title}</li>
    <li><strong>Description:</strong>${project_description}</li>
    <li><strong>URL:</strong> <a href=${project_url} target="_blank" style="color: #00C5FF;">${project_url}</a></li>
  </ul>

  <p style="font-size: 16px; color: #333;">Please review the project and confirm its authenticity:</p>

  <div style="margin-top: 20px;text-align: center">
    <a href="${redirectUrl}" target="_blank" style="
        background: #00C5FF;
        color: #fff;
        padding: 12px 24px;
        font-size: 16px;
        text-decoration: none;
        font-weight: bold;
        display: inline-block;
        border-radius: 5px;
        transition: background 0.3s;">
      Verify Project
    </a>
  </div>

  <p style="font-size: 16px; color: #333; margin-top: 20px;">Thank you,</p>
  <p style="font-size: 16px; font-weight: bold; color: #00C5FF;">Verification Team</p>
</div>

`,

        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({message: "Verification email sent successfully."});
    } catch (error) {
        res.status(500).json({message: "Error sending email", error: error.message});
    }
};

const updateProjectVerification = async (req, res) => {
    try {
        const {token, userId, projectId} = req.query;

        if (!token || !userId || !projectId) {
            return res.status(400).send(`
                <div style="text-align: center; padding: 20px;">
                    <h2 style="color: red;">Invalid Request </h2>
                    <p>Missing token or user ID.</p>
                </div>
            `);
        }

        const project = await Projects.findOne({user_id: userId, _id: projectId});

        if (!project) {
            return res.status(404).send(`
                <div style="text-align: center; padding: 20px;">
                    <h2 style="color: red;">User Not Found </h2>
                    <p>The user does not exist.</p>
                </div>
            `);
        }

        if (project.verification_token !== token) {
            return res.status(400).send(`
                <div style="text-align: center; padding: 20px;">
                    <h2 style="color: red;">Invalid Token </h2>
                    <p>The verification token is incorrect.</p>
                </div>
            `);
        }

        project.is_project_verified = true;
        project.verification_token = null;
        await project.save();

        return res.send(`
    <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f4f7f9;
        font-family: Arial, sans-serif;
    ">
        <div style="
            background: white;
            padding: 40px;
            text-align: center;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 100%;
        ">
            <img src="https://cdn-icons-png.flaticon.com/512/845/845646.png" 
                 alt="Success" 
                 width="100" 
                 style="margin-bottom: 20px;">
            <h1 style="color: #2d8a42; margin-bottom: 10px;">Project Verified!</h1>
            <p style="color: #555; font-size: 16px;">
                Thank you for verifying your project. Your confirmation has been recorded successfully.
            </p>
        </div>
    </div>
`);

    } catch (error) {
        res.status(500).send(`
            <div style="text-align: center; padding: 20px;">
                <h2 style="color: red;">Verification Failed </h2>
                <p>Error: ${error.message}</p>
            </div>
        `);
    }
};

module.exports = {
    sendExperienceVerificationEmail, updateUserVerification, sendProjectVerificationEmail, updateProjectVerification
};