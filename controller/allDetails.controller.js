const BasicDetails = require('../models/BasicDetails')
const InternationalEducation = require('../models/InternationalEducation')
const CanadianEducation = require('../models/canadianEducation')
const WorkExperience = require('../models/workExperience')
const CoreSkills = require('../models/coreSkills')
const SubSkills = require('../models/subSkills')
const CareerGoal = require('../models/careerGoal')
const Project = require('../models/project')
const Accomplishments = require('../models/accomplishments')
const fs = require('fs');
const sendOkResponse = require('../responses/ok')
const sendServerErrorResponse = require('../responses/serverError')
const sendCreatedRequestResponse = require('../responses/created')
const nodemailer = require('nodemailer')
const config = require('config')
const {uploadFile, uploadVideo} = require("../helpers/uploadFile");
const path = require('path');

const uploadFileToS3 = async (filePath, isVideo = false) => {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        const mimeType = isVideo ? 'video/mp4' : 'image/jpeg'; // or use `mime-types` lib to auto detect

        const res = isVideo
            ? await uploadVideo(fileBuffer, fileName, mimeType)
            : await uploadFile(fileBuffer, fileName, mimeType);
        return res
    } catch (error) {
        console.error("S3 Upload Error:", error);
        return null;
    }
};

async function sendEmail(to, link, userId, company_name) {
    const user = await BasicDetails.findOne({user_id: userId})
    try {
        // if (userId) {
        //   console.log('Employee or Company not found');
        //   return;
        // }
        const emailContent = `
      Hello,

      This employee, ${user.firstname} ${user.lastname} is working at your company, ${company_name}.
      Please fill out this form to verify their details and provide feedback on their performance.

      Click here to verify and provide feedback: ${link}

      Best regards & Thanks,
      ZEROED   `

        // Configure nodemailer transport
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            secure: true,
            auth: {
                user: config.get('appEmail'), pass: config.get('appPassword')
            },
        });
        const mailOptions = {
            from: config.get('appEmail'), to: to, // Recipient email address
            subject: 'Employee Verification and Feedback Request', text: emailContent,
        }

        // Send the email
        await transporter.sendMail(mailOptions)
        console.log('Email sent successfully')
    } catch (error) {
        console.error('Error sending email:', error)
    }
}

exports.createInformationOld = async (req, res) => {
    try {
        const {
            basicDetails,
            internationalEducation,
            canadianEducation,
            coreSkillsWithSubSkills,
            workExperience,
            careerGoal, // accomplishments,
        } = req.body

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.')
        }

        const profile_pic = req.files['profile_pic']?.[0]
        const video = req.files['video']?.[0]
        const secondary_video = req.files['secondary_video']?.[0]

        // Create Basic Details
        const basicDetailsDoc = new BasicDetails({
            profile_pic: profile_pic.path, video: video.path, secondary_video: secondary_video.path, ...basicDetails,
        })
        await basicDetailsDoc.save()

        // Create International Education
        const internationalEducationDoc = new InternationalEducation({
            user_id: basicDetailsDoc.user_id, ...internationalEducation,
        })
        await internationalEducationDoc.save()

        const canadianEducationDoc = new CanadianEducation({
            user_id: basicDetailsDoc.user_id, ...canadianEducation,
        })
        await canadianEducationDoc.save()

        // Create Canadian Education
        // const canadianEducationDoc = new CanadianEducation({
        //   user_id: basicDetailsDoc.user_id,
        //   ...canadianEducation,
        // })
        JSON.parse(coreSkillsWithSubSkills)

        console.log('coreSkillsWithSubSkills', coreSkillsWithSubSkills)
        // Skills
        try {
            const createdCoreSkills = []

            for (const coreSkillData of coreSkillsWithSubSkills) {
                // Create a new Core Skill
                const addCoreSkill = new CoreSkills({
                    user_id: basicDetails?.user_id, core_skill: coreSkillData.coreSkill,
                })

                const savedCoreSkill = await addCoreSkill.save()
                createdCoreSkills.push(savedCoreSkill)

                // 2. Add Sub Skills for this Core Skill
                if (coreSkillData.subSkills && coreSkillData.subSkills.length > 0) {
                    for (const subSkill of coreSkillData.subSkills) {
                        const skill_certificate = req?.files['skills[certificate]']?.[0] || ''
                        const addSubSkill = new SubSkills({
                            user_id: basicDetails?.user_id,
                            core_skill_id: savedCoreSkill._id,
                            sub_skills: subSkill.subSkill,
                            certificate: subSkill.certificate,
                            link: subSkill.link,
                        })
                        await addSubSkill.save()
                    }
                }
            }
            console.log('Core skills and subskills added successfully!')
        } catch (error) {
            console.error('Error adding core skills and sub skills:', error)
        }

        // Create Accomplishments
        const accomplishmentIds = [] // Array to store accomplishment IDs

        for (const accomplishment of workExperience) {
            const accomplishmentsDoc = new Accomplishments({
                user_id: basicDetailsDoc.user_id,
                accomplishment_1: accomplishment.accomplishment_1,
                accomplishment_2: accomplishment.accomplishment_2,
                accomplishment_3: accomplishment.accomplishment_3,
                accomplishment_4: accomplishment.accomplishment_4,
                accomplishment_5: accomplishment.accomplishment_5,
            })

            await accomplishmentsDoc.save()
            accomplishmentIds.push(accomplishmentsDoc._id)
        }

        // Create Work Experience
        for (let i = 0; i < workExperience.length; i++) {
            const experience = workExperience[i]
            const workExperienceDoc = new WorkExperience({
                user_id: basicDetailsDoc.user_id,
                work_experience_year: experience.work_experience_year,
                work_experience_industry: experience.work_experience_industry,
                work_experience_sub_industry: experience.work_experience_sub_industry,
                work_experience_country: experience.work_experience_country,
                work_experience_city: experience.work_experience_city,
                work_experience_job_title: experience.work_experience_job_title,
                work_experience_company_name: experience.work_experience_company_name,
                reference_check: experience.reference_check,
                reference: experience.reference,
                reference_name: experience.reference_name,
                reference_email: experience.reference_email,
                work_experience_company_website: experience.work_experience_company_website,
                experience_start_date: experience.experience_start_date,
                experience_end_date: experience.experience_end_date !== 'null' ? experience.experience_end_date : null,
                isCurrentlyWorking: experience.isCurrentlyWorking,
                accomplishments_id: accomplishmentIds[i],
                email: experience.email,
            })
            await workExperienceDoc.save()

            if (experience.email) {
                const localAPI = config.get('liveDBURL')
                const verificationLink = `${localAPI}user/verify-email/${basicDetailsDoc.user_id}`
                await sendEmail(experience.email, verificationLink, basicDetailsDoc.user_id, experience.work_experience_company_name,)
            }
        }

        // Create Career Goal
        const careerGoalDoc = new CareerGoal({
            user_id: basicDetailsDoc.user_id, ...careerGoal,
        })
        await careerGoalDoc.save()

        // Send response after everything is done
        return sendCreatedRequestResponse(res, {}, 'Profile added successfully', [])
    } catch (error) {
        console.log('Erro................r :', error)
        return res.status(500).send('Internal server error!')
    }
}
const sanitize = (str) => str.trim().toLowerCase().replace(/\s+/g, "");
const isValidUrl = (string) => {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
};

exports.createInformation = async (req, res) => {
    try {
        const {
            basicDetails,
            internationalEducation,
            canadianEducation,
            coreSkillsWithSubSkills,
            workExperience,
            careerGoal,
            projectDetails
        } = req.body

        let parsedBasicDetails = basicDetails
        let parsedProjectDetails = projectDetails
        let parsedCoreSkillsWithSubSkills = coreSkillsWithSubSkills

        if (typeof basicDetails === 'string') {
            parsedBasicDetails = JSON.parse(basicDetails)
        }
        if (typeof projectDetails === 'string') {
            parsedProjectDetails = JSON.parse(projectDetails)
        }
        if (typeof coreSkillsWithSubSkills === 'string') {
            parsedCoreSkillsWithSubSkills = JSON.parse(coreSkillsWithSubSkills)
        }

        // Map uploaded files by field name
        const fileMap = {}
        if (req.files && req.files.length > 0) {
            req.files.forEach((file) => {
                fileMap[file.fieldname] = file
            })
        }
        let videoUrl = null;

        const profilePicUrl = fileMap['profile_pic'] ? await uploadFileToS3(fileMap['profile_pic'].path) : null;
        if (parsedBasicDetails.video && parsedBasicDetails.video.startsWith('https://res.cloudinary.com')) {
            videoUrl = parsedBasicDetails.video;
        } else if (fileMap['video']) {
            videoUrl = await uploadFileToS3(fileMap['video'].path, true);
        }

        const basicDetailsDoc = new BasicDetails({
            ...parsedBasicDetails, profile_pic: profilePicUrl, video: videoUrl,
            slug: `${sanitize(parsedBasicDetails.firstname)}-${sanitize(parsedBasicDetails.lastname)}-${parsedBasicDetails.user_id}`,
        })
        await basicDetailsDoc.save()

        for (const [coreIndex, coreSkillData,] of parsedCoreSkillsWithSubSkills.entries()) {
            const coreSkillName = coreSkillData.coreSkill
            if (!coreSkillName) continue // Skip empty core skills

            // Create Core Skill
            const coreSkillDoc = new CoreSkills({
                user_id: basicDetailsDoc.user_id, core_skill: coreSkillName,
            })
            await coreSkillDoc.save()

            const subSkills = coreSkillData.subSkills;

            for (const [subIndex, subSkillData] of subSkills.entries()) {
                const fieldname = `certificate_core_${coreIndex}_sub_${subIndex}`;
                const certificateFile = fileMap[fieldname];

                let certificateUrl = null;
                if (certificateFile) {
                    certificateUrl = await uploadFileToS3(certificateFile.path);
                }

                const subSkillDoc = new SubSkills({
                    user_id: basicDetailsDoc.user_id,
                    core_skill_id: coreSkillDoc._id,
                    sub_skills: subSkillData.subSkill,
                    link: subSkillData.link,
                    certificate: certificateUrl,
                });

                await subSkillDoc.save();
            }

        }

        // Process International Education
        if (internationalEducation.length > 0) {
            for (const item of internationalEducation) {
                const internationalEducationDoc = new InternationalEducation({
                    user_id: basicDetailsDoc.user_id, ...item,
                })
                await internationalEducationDoc.save()
            }
        }
        if (canadianEducation.length > 0) {
            for (const item of canadianEducation) {
                const canadianEducationDoc = new CanadianEducation({
                    user_id: basicDetailsDoc.user_id, ...item,
                })
                await canadianEducationDoc.save()
            }
        }

        // Process Canadian Education
        // if (canadianEducation) {
        //   const canadianEducationDoc = new CanadianEducation({
        //     user_id: basicDetailsDoc.user_id,
        //     ...canadianEducation,
        //   })
        //   await canadianEducationDoc.save()
        // }

        // Process Work Experience and Accomplishments
        if (parsedProjectDetails.length > 0) {
            for (const item of projectDetails) {
                const ProjectData = new Project({
                    user_id: parsedBasicDetails.user_id, ...item
                })

                await ProjectData.save()
            }
        }
        if (workExperience && workExperience.length > 0) {
            const accomplishmentIds = []

            for (const experience of workExperience) {
                // Save Accomplishments
                const accomplishmentsDoc = new Accomplishments({
                    user_id: basicDetailsDoc.user_id,
                    accomplishment_1: experience.accomplishment_1,
                    accomplishment_2: experience.accomplishment_2,
                    accomplishment_3: experience.accomplishment_3,
                    accomplishment_4: experience.accomplishment_4, // createdBy: mongoose.Types.ObjectId(req.user.id), // Adjust according to your data structure
                })
                await accomplishmentsDoc.save()
                accomplishmentIds.push(accomplishmentsDoc._id)

                let formattedStartDate
                if (experience.experience_start_date) {
                    // Convert the date string into a Date object
                    const date = new Date(experience.experience_start_date)

                    // Usage
                    formattedStartDate = formatDate(date)
                    // console.log("formattedStartDate: ", formattedStartDate); // Output: 11/24/2021
                }

                console.log('experience.experience_end_date', experience.experience_end_date,)

                let formattedEndDate
                if (experience.experience_end_date !== null) {
                    // Convert the date string into a Date object
                    const date = new Date(experience.experience_end_date)
                    // Usage
                    formattedEndDate = formatDate(date)
                    // console.log("formattedEndDate: ", formattedEndDate); // Output: 11/24/2021
                }
                // Save Work Experience
                const workExperienceDoc = new WorkExperience({
                    user_id: basicDetailsDoc.user_id,
                    work_experience_industry: experience.work_experience_industry || null,
                    work_experience_sub_industry: experience.work_experience_sub_industry || null,
                    work_experience_country: experience.work_experience_country || null,
                    work_experience_job_title: experience.work_experience_job_title || null,
                    work_experience_company_name: experience.work_experience_company_name || null,
                    work_experience_company_website: experience.work_experience_company_website || null,
                    reference_check: experience.reference_check,
                    reference: experience.reference,
                    reference_name: experience.reference_name,
                    reference_email: experience.reference_email,
                    experience_start_date: formattedStartDate,
                    experience_end_date: formattedEndDate || null,
                    isCurrentlyWorking: experience.isCurrentlyWorking || false,
                    email: experience.email || null,
                    isVerify: experience.isVerify || false,
                    verificationName: experience.verificationName || null,
                    verificationDesignation: experience.verificationDesignation || null,
                    verificationFeedback: experience.verificationFeedback || null,
                    verificationToken: experience.verificationToken || null, // ...experience, // Include other fields
                    accomplishments_id: accomplishmentsDoc?._id,
                })
                await workExperienceDoc.save()

                // Send Email if email exists
                if (experience.email) {
                    const localAPI = config.get('liveDBURL')
                    const verificationLink = `${localAPI}user/verify-email/${basicDetailsDoc.user_id}`
                    console.log(experience.email, verificationLink, basicDetailsDoc.user_id, experience.work_experience_company_name)
                    await sendEmail(experience.email, verificationLink, basicDetailsDoc.user_id, experience.work_experience_company_name)
                }
            }
        }

        // Process Career Goal
        if (careerGoal) {
            const careerGoalDoc = new CareerGoal({
                user_id: basicDetailsDoc.user_id, ...careerGoal,
            })
            await careerGoalDoc.save()
        }

        // Send success response
        return sendCreatedRequestResponse(res, {}, 'Profile added successfully', [])
    } catch (error) {
        console.error('Error in createInformation:', error)
        return res.status(500).send('Internal server error!')
    }
}

exports.updateSecondaryVideo = async (req, res) => {
    try {
        const {userId} = req.params;
        if (!userId) {
            return res.status(400).json({message: 'User ID is required'});
        }

        if (!req.file) {
            return res.status(400).json({message: 'Secondary video file is required'});
        }

        // Upload video to Cloudinary
        const secondaryVideoUrl = await uploadFileToS3(req.file.path, true);

        if (!secondaryVideoUrl) {
            return res.status(500).json({message: 'Error uploading secondary video'});
        }

        // Update user's secondary video URL in DB
        const updatedData = await BasicDetails.findOneAndUpdate({user_id: userId}, {secondary_video: secondaryVideoUrl}, {new: true});

        if (!updatedData) {
            return res.status(404).json({message: 'User not found'});
        }

        return res.status(200).json({
            message: 'Secondary video updated successfully', data: updatedData,
        });
    } catch (error) {
        console.error('Error updating secondary video:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

// Get profile information
exports.getInformation = async (req, res) => {
    try {
        let {userId} = req.params;
        if (userId.includes('-')) {
            userId = userId.split('-')[2];
        }

        if (!userId) {
            return res.status(400).json({success: false, message: "User ID  is required"});
        }

        // Fetch Basic Details
        const basicDetailsDoc = await BasicDetails.findOne({user_id: userId});
        if (!basicDetailsDoc) {
            return res.status(404).json({success: false, message: "Basic details not found"});
        }

        // Fetch Other Data
        const internationalEducationDoc = await InternationalEducation.find({user_id: userId});
        const canadianEducationDoc = await CanadianEducation.find({user_id: userId});
        const workExperienceDocs = await WorkExperience.find({user_id: userId}).populate("accomplishments_id");
        const projectDocs = await Project.find({user_id: userId})

        // Fetch Career Goal
        const careerGoalDoc = await CareerGoal.findOne({user_id: userId})

        // SkillDoc data
        let skillResponse = []
        const skillsDoc = await CoreSkills.find({user_id: userId})
        for (const element of skillsDoc) {
            const subskill = await SubSkills.find({core_skill_id: element._id});
            let obj = element.toObject();
            obj.subSkill = subskill;
            skillResponse.push(obj);
        }

        // Construct the response object
        const responseData = {
            basicDetails: basicDetailsDoc,
            internationalEducation: internationalEducationDoc,
            canadianEducation: canadianEducationDoc,
            skills: skillResponse,
            workExperience: workExperienceDocs,
            careerGoal: careerGoalDoc,
            projectDetails: projectDocs,
        }

        // Send the response
        return res.status(200).json({
            success: true, message: "Details fetched successfully!", data: responseData,
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: "Internal server error!",
        });
    }
};

// Update profile data
exports.updateInformation = async (req, res) => {
    try {
        const {
            basicDetails,
            internationalEducation,
            canadianEducation,
            coreSkillsWithSubSkills,
            workExperience,
            careerGoal,
            projectDetails,
            is_canadianEducation,
            is_internationalEducation
        } = req.body;

        const userId = req.params.id;

        // Parse JSON strings if necessary
        let parsedBasicDetails = basicDetails;
        let parsedCoreSkillsWithSubSkills = coreSkillsWithSubSkills;

        if (typeof basicDetails === "string") {
            parsedBasicDetails = JSON.parse(basicDetails);
        }
        if (typeof coreSkillsWithSubSkills === "string") {
            parsedCoreSkillsWithSubSkills = JSON.parse(coreSkillsWithSubSkills);
        }

        const isInternational = (is_internationalEducation === true || is_internationalEducation === "true");
        const isCanadian = (is_canadianEducation === true || is_canadianEducation === "true");

        if (!isInternational) {
            await InternationalEducation.deleteMany({ user_id: parsedBasicDetails.user_id });
        }
        if (!isCanadian) {
            await CanadianEducation.deleteMany({ user_id: parsedBasicDetails.user_id });
        }

        // Map uploaded files by field name
        const fileMap = {};
        if (req.files && req.files.length > 0) {
            req.files.forEach((file) => {
                fileMap[file.fieldname] = file;
            });
        }

        let videoUrl = null;
        let secondaryVideoUrl = null;

        const profilePicUrl = fileMap["profile_pic"] ? await uploadFileToS3(fileMap["profile_pic"].path) : null;

        // Handle main video - check if it's already a URL from frontend
        if (req.body.video && isValidUrl(req.body.video)) {
            // Video URL already provided from frontend
            videoUrl = req.body.video;
            console.log('Using video URL from frontend:', videoUrl);
        } else if (fileMap["video"]) {
            // Video file uploaded through backend
            videoUrl = await uploadFileToS3(fileMap["video"].path, true);
            console.log('Uploaded video through backend:', videoUrl);
        }

        // Handle secondary video - check if it's already a URL from frontend
        if (req.body.secondary_video && isValidUrl(req.body.secondary_video)) {
            // Secondary video URL already provided from frontend
            secondaryVideoUrl = req.body.secondary_video;
            console.log('Using secondary video URL from frontend:', secondaryVideoUrl);
        } else if (fileMap["secondary_video"]) {
            // Secondary video file uploaded through backend
            secondaryVideoUrl = await uploadFileToS3(fileMap["secondary_video"].path, true);
            console.log('Uploaded secondary video through backend:', secondaryVideoUrl);
        }

        // Update Basic Details
        const basicDetailsUpdate = {
            ...(profilePicUrl ? {profile_pic: profilePicUrl} : {}),
            ...(videoUrl ? {video: videoUrl} : {}),
            ...(secondaryVideoUrl ? {secondary_video: secondaryVideoUrl} : {}),
            ...parsedBasicDetails,
        };

        const updatedDetails = await BasicDetails.findOneAndUpdate({user_id: userId}, basicDetailsUpdate, {new: true});

        // Update Core Skills and Sub-Skills
        if (Array.isArray(parsedCoreSkillsWithSubSkills)) {
            for (const [coreIndex, coreSkillData] of parsedCoreSkillsWithSubSkills.entries()) {
                const {coreSkill, subSkills, _id: coreSkillId} = coreSkillData;
                if (!coreSkill) continue;

                let coreSkillDoc;
                if (coreSkillId) {
                    coreSkillDoc = await CoreSkills.findByIdAndUpdate(coreSkillId, {core_skill: coreSkill}, {new: true});
                } else {
                    coreSkillDoc = await CoreSkills.create({user_id: userId, core_skill: coreSkill});
                }

                if (coreSkillDoc) {
                    const subSkillIds = subSkills.map((s) => s._id).filter(Boolean);
                    await SubSkills.deleteMany({core_skill_id: coreSkillDoc._id, _id: {$nin: subSkillIds}});

                    for (const [subIndex, subSkillData] of subSkills.entries()) {
                        const fieldname = `certificate_core_${coreIndex}_sub_${subIndex}`;
                        const certificateFile = fileMap[fieldname];

                        let certificateUrl = certificateFile ? await uploadFileToS3(certificateFile.path) : subSkillData.certificate || null;

                        if (subSkillData._id) {
                            await SubSkills.findByIdAndUpdate(subSkillData._id, {
                                sub_skills: subSkillData.subSkill, link: subSkillData.link, certificate: certificateUrl
                            }, {new: true});
                        } else {
                            await SubSkills.create({
                                user_id: userId,
                                core_skill_id: coreSkillDoc._id,
                                sub_skills: subSkillData.subSkill,
                                link: subSkillData.link,
                                certificate: certificateUrl,
                            });
                        }
                    }
                }
            }
        }

        // Update or Create Projects
        if (canadianEducation?.length > 0) {
            for (const item of canadianEducation) {
                if (item._id) {
                    await CanadianEducation.findByIdAndUpdate(item._id, item, {new: true});
                } else {
                    await CanadianEducation.create({user_id: userId, ...item});
                }
            }
        }

        if (projectDetails?.length > 0) {
            for (const item of projectDetails) {
                if (item._id) {
                    await Project.findByIdAndUpdate(item._id, item, {new: true});
                } else {
                    await Project.create({user_id: userId, ...item});
                }
            }
        }

        // Update International Education
        if (internationalEducation?.length > 0) {
            for (const item of internationalEducation) {
                if (item._id) {
                    await InternationalEducation.findByIdAndUpdate(item._id, item, {new: true});
                } else {
                    await InternationalEducation.create({user_id: userId, ...item});
                }
            }
        }

        if (workExperience && workExperience.length > 0) {
            for (const experience of workExperience) {
                let accomplishmentsDoc;

                if (experience.accomplishments_id) {
                    accomplishmentsDoc = await Accomplishments.findByIdAndUpdate(experience.accomplishments_id, {
                        accomplishment_1: experience.accomplishment_1,
                        accomplishment_2: experience.accomplishment_2,
                        accomplishment_3: experience.accomplishment_3,
                        accomplishment_4: experience.accomplishment_4,
                    }, {new: true});
                } else {
                    accomplishmentsDoc = new Accomplishments({
                        user_id: userId,
                        accomplishment_1: experience.accomplishment_1,
                        accomplishment_2: experience.accomplishment_2,
                        accomplishment_3: experience.accomplishment_3,
                        accomplishment_4: experience.accomplishment_4,
                    });
                    await accomplishmentsDoc.save();
                }

                const formattedStartDate = experience.experience_start_date ? formatDate(new Date(experience.experience_start_date)) : null;
                const formattedEndDate = experience.experience_end_date ? formatDate(new Date(experience.experience_end_date)) : null;

                if (experience._id) {
                    await WorkExperience.findByIdAndUpdate(experience._id, {
                        work_experience_industry: experience.work_experience_industry || null,
                        work_experience_sub_industry: experience.work_experience_sub_industry || null,
                        work_experience_country: experience.work_experience_country || null,
                        work_experience_job_title: experience.work_experience_job_title || null,
                        work_experience_company_name: experience.work_experience_company_name || null,
                        work_experience_company_website: experience.work_experience_company_website || null,
                        reference_check: experience.reference_check || null,
                        reference: experience.reference || null,
                        reference_name: experience.reference_name || null,
                        reference_email: experience.reference_email || null,
                        experience_start_date: formattedStartDate,
                        experience_end_date: formattedEndDate || null,
                        isCurrentlyWorking: experience.isCurrentlyWorking || false,
                        email: experience.email || null,
                        isVerify: experience.isVerify || false,
                        verificationName: experience.verificationName || null,
                        verificationDesignation: experience.verificationDesignation || null,
                        verificationFeedback: experience.verificationFeedback || null,
                        verificationToken: experience.verificationToken || null,
                        accomplishments_id: accomplishmentsDoc._id,
                    }, {new: true});
                } else {
                    const newExperience = new WorkExperience({
                        user_id: userId,
                        work_experience_industry: experience.work_experience_industry || null,
                        work_experience_sub_industry: experience.work_experience_sub_industry || null,
                        work_experience_country: experience.work_experience_country || null,
                        work_experience_job_title: experience.work_experience_job_title || null,
                        work_experience_company_name: experience.work_experience_company_name || null,
                        work_experience_company_website: experience.work_experience_company_website || null,
                        reference_check: experience.reference_check || null,
                        reference: experience.reference || null,
                        reference_name: experience.reference_name || null,
                        reference_email: experience.reference_email || null,
                        experience_start_date: formattedStartDate,
                        experience_end_date: formattedEndDate || null,
                        isCurrentlyWorking: experience.isCurrentlyWorking || false,
                        email: experience.email || null,
                        isVerify: experience.isVerify || false,
                        verificationName: experience.verificationName || null,
                        verificationDesignation: experience.verificationDesignation || null,
                        verificationFeedback: experience.verificationFeedback || null,
                        verificationToken: experience.verificationToken || null,
                        accomplishments_id: accomplishmentsDoc._id,
                    });
                    await newExperience.save();
                }
            }
        }

        // Update Career Goal
        if (careerGoal) {
            await CareerGoal.findOneAndUpdate({user_id: userId}, careerGoal, {new: true, upsert: true});
        }

        return sendCreatedRequestResponse(res, {}, "Profile updated successfully", []);
    } catch (error) {
        console.error("Error in updateInformation:", error);
        return res.status(500).send("Internal server error!");
    }
};

// Function to format the date
const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0') // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
}

