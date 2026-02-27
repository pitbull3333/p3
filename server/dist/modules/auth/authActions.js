"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userRepository_1 = __importDefault(require("../user/userRepository"));
const http_status_codes_1 = require("http-status-codes");
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logIn = async (req, res, next) => {
    try {
        const user = await userRepository_1.default.readByEmail(req.body.email);
        if (!user) {
            res.sendStatus(http_status_codes_1.StatusCodes.UNPROCESSABLE_ENTITY);
            return;
        }
        const verified = await argon2_1.default.verify(user.password, req.body.password);
        if (verified) {
            const { password, ...userWithoutPassword } = user;
            const myPayload = {
                sub: user.id.toString(),
            };
            const token = await jsonwebtoken_1.default.sign(myPayload, process.env.APP_SECRET, {
                expiresIn: "12h",
            });
            res.json({
                token,
                user: userWithoutPassword,
            });
        }
        else {
            res.sendStatus(http_status_codes_1.StatusCodes.UNPROCESSABLE_ENTITY);
        }
    }
    catch (err) {
        next(err);
    }
};
const verifyToken = (req, res, next) => {
    try {
        const authorizationHeader = req.get("Authorization");
        if (authorizationHeader == null) {
            return next();
        }
        const [type, token] = authorizationHeader.split(" ");
        if (type !== "Bearer") {
            throw new Error("Authorization header has not the 'Bearer' type");
        }
        req.auth = jsonwebtoken_1.default.verify(token, process.env.APP_SECRET);
        next();
    }
    catch (err) {
        console.error(err);
        res.sendStatus(401);
    }
};
exports.default = { logIn, verifyToken };
