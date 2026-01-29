const jwt = require("jsonwebtoken");
const config = require("config");
const sendUnAuthorizedResponse = require("../responses/unauthorizedError");

module.exports = function (req, res, next) {
    const token = req.header("Authorization");

    if (!token) {
        return sendUnAuthorizedResponse(
            res,
            { isForceLogout: true },
            "Your session token has expired! Please log in again!",
            []
        );
    }

    try {
        const decoded = jwt.verify(token, config.get("jwtSecret"));
        req.user = decoded;
        if (!req.user || req.user.role !== "ADMIN") {
            return sendUnAuthorizedResponse(
                res,
                {},
                "Access denied! Only admins are allowed.",
                []
            );
        }

        next();
    } catch (err) {
        return sendUnAuthorizedResponse(
            res,
            { isForceLogout: true },
            "Your session token has expired! Please log in again!",
            []
        );
    }
};
