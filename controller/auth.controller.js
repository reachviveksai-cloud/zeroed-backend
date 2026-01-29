const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const User = require('../models/User')
const Chat = require('../models/Chat')
const BasicDetails = require('../models/BasicDetails')
const config = require('config')
const sendBadRequestResponse = require('../responses/badRequest')
const sendOkResponse = require('../responses/ok')
const sendCreatedRequestResponse = require('../responses/created')
const sendServerErrorResponse = require('../responses/serverError')
const sendNotFoundResponse = require('../responses/notFound')

const crypto = require('crypto')

// Function to send verification email
const sendVerificationEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.eu',
        port: 465,
        secure: true,
        auth: {
            user: config.get('appEmail'), pass: config.get('appPassword')
        },
    });

    await transporter.sendMail({
        from: config.get('appEmail'),
        to: email,
        subject: 'Email Verification OTP',
        text: `Your OTP for email verification is: ${otp}.`,
    })
}

// Register
const generateOTP = () => crypto.randomInt(1000, 9999).toString(); // Secure 4-digit OTP

const sanitize = (str) => str.trim().toLowerCase().replace(/\s+/g, "");

exports.doRegister = async (req, res) => {
    const {
        email,
        password,
        role,
        userName,
        firstname,
        lastname
    } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return sendBadRequestResponse(res, {}, 'Email already registered!');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();

        const newUser = new User({
            email,
            password: hashedPassword,
            otp,
            role: role && ['ADMIN', 'USER'].includes(role) ? role : 'USER',
            userName: userName || null,
        });

        await sendVerificationEmail(email, otp);
        await newUser.save();

        const newDetails = new BasicDetails({
            user_id: newUser._id,
            firstname,
            lastname,
            slug: `${sanitize(firstname)}-${sanitize(lastname)}-${newUser._id}`
        });

        await newDetails.save();

        return sendCreatedRequestResponse(
            res,
            {},
            'User registered! Please check your email for the OTP.',
            []
        );
    } catch (error) {
        return sendBadRequestResponse(
            res,
            {},
            'Error registering user: ' + error.message,
            error
        );
    }
};

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user || user.otp !== otp || user.otpExpiration < Date.now()) {
            return sendBadRequestResponse(res, {}, 'Invalid or expired OTP.')
        }

        user.isVerified = true
        user.otp = undefined
        user.otpExpiration = undefined
        await user.save()

        return sendOkResponse(res, {}, 'Email verified successfully!', [])
    } catch (error) {
        return sendServerErrorResponse(res, {}, 'Internal server error!', [])
    }
}

exports.doLogin = async (req, res) => {
    const { email, password, userName } = req.body;

    try {
        let user;

        if (userName) {
            user = await User.findOne({ userName, role: "ADMIN" });
        } else if (email) {
            user = await User.findOne({ email, role: "USER" });
        } else {
            return sendBadRequestResponse(res, {}, "Invalid credentials.");
        }

        if (!user) {
            return sendBadRequestResponse(res, {}, "Invalid credentials.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendBadRequestResponse(res, {}, "Invalid credentials.");
        }

        if (!user.isVerified) {
            return sendBadRequestResponse(res, {}, "Please verify your email before logging in.");
        }

        const token = jwt.sign(
            { email: user.email, userName: user.userName, role: user.role, id: user._id.toString() },
            config.get("jwtSecret"),
            { expiresIn: "365d" }
        );

        return sendOkResponse(
            res,
            {
                token: token,
                user: {
                    id: user._id,
                    email: user.email,
                    userName: user.userName,
                    role: user.role,
                },
            },
            "Login successful!",
            []
        );
    } catch (error) {
        return sendServerErrorResponse(res, {}, "Internal server error!", []);
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const search = req.query.search;
        const matchStage = {};

        if (search) {
            const regexSearch = new RegExp(search, "i");

            matchStage.$or = [
                { email: { $regex: regexSearch } }
            ];
        }

        const users = await User.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: "basicDetails",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "basicDetails"
                }
            },
            {
                $addFields: {
                    basicDetails: { $arrayElemAt: ["$basicDetails", 0] }
                }
            },
            {
                $match: search ? {
                    $or: [
                        { "email": { $regex: search, $options: "i" } },
                        { "basicDetails.firstname": { $regex: search, $options: "i" } },
                        { "basicDetails.lastname": { $regex: search, $options: "i" } },
                    ]
                } : {}
            },
            {
                $project: {
                    password: 0
                }
            }
        ]);

        return sendOkResponse(res, users, "Users fetched successfully!", []);
    } catch (error) {
        console.error(error);
        return sendServerErrorResponse(res, {}, "Internal server error!", []);
    }
};


exports.forgotPassword = async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user) {
            // return res.status(404).send('User not found')
            return sendNotFoundResponse(res, {}, 'User not registered!', [])
        }

        // Generate OTP
        const otp = crypto.randomInt(1000, 9999).toString()
        user.otp = otp
        user.otpExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
        await user.save()

        // Send OTP email
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            secure: true,
            auth: {
                user: config.get('appEmail'), pass: config.get('appPassword')
            },
        });

        await transporter.sendMail({
            from: config.get('appEmail'),
            to: email,
            subject: 'Email Verification OTP',
            text: `Your OTP for email verification is: ${otp}.`,
        })

        return sendOkResponse(res, {}, 'OTP sent to your email', [])
    } catch (error) {
        return sendServerErrorResponse(res, {}, 'Internal server error!' + error, [])
    }
}

exports.OTPverifyPassword = async (req, res) => {
    const { email, otp } = req.body
    try {
        const user = await User.findOne({ email })

        if (!user || user.otp !== otp || Date.now() > user.otpExpires) {
            return res.status(400).send('Invalid or expired OTP')
        }

        // OTP is valid, clear it
        user.otp = undefined
        user.otpExpires = undefined
        await user.save()

        return sendOkResponse(
            res,
            {},
            'OTP verified, you can now reset your password',
            [],
        )
    } catch {
        return sendServerErrorResponse(res, {}, 'Internal server error!', [])
    }
}

exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).send('User not found')
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        await user.save()

        return sendOkResponse(res, {}, 'Password reset successful', [])
    } catch (error) {
        return sendServerErrorResponse(res, {}, 'Internal server error!', [])
    }
}

exports.createUser = async (req, res) => {
    const { firstname, lastname, email, receiver_id } = req.body;

    try {
        if (!firstname || !lastname || !email || !receiver_id) {
            return sendBadRequestResponse(res, {}, 'All fields are required', []);
        }

        let user = await User.findOne({ email });
        let isNewUser = false;
        let newUser;

        if (!user) {
            const defaultPassword = crypto.randomBytes(8).toString('hex');
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);

            newUser = new User({
                email,
                password: hashedPassword,
            });

            await newUser.save();

            const newDetails = new BasicDetails({
                user_id: newUser._id,
                firstname,
                lastname,
                slug: `${sanitize(firstname)}-${sanitize(lastname)}-${newUser._id}`
            });

            await newDetails.save();

            user = newUser;
            isNewUser = true;
        }

        let chat = await Chat.findOne({
            participants: { $all: [user._id, receiver_id] }
        });

        if (!chat) {
            chat = new Chat({ participants: [user._id, receiver_id] });
            await chat.save();
        }

        const token = jwt.sign(
            {
                email: user.email,
                id: user._id.toString()
            },
            config.get("jwtSecret"),
            { expiresIn: "365d" }
        );

        if (user.password) {
            user.password = undefined;
        }

        const responseData = {
            user,
            chat,
            token,
        };

        if (isNewUser) {
            // responseData.defaultPassword = '12345678'; // Removed for security
        }

        return sendOkResponse(
            res,
            responseData,
            isNewUser ? 'User created and chat initialized' : 'User already exists, chat initialized',
            []
        );
    } catch (error) {
        console.error('Create User Error:', error);
        return sendServerErrorResponse(res, {}, 'Internal server error!', []);
    }
};
