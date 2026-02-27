"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const participationRepository_1 = __importDefault(require("./participationRepository"));
const participationRepository_2 = __importDefault(require("./participationRepository"));
const activityRepository_1 = __importDefault(require("../activity/activityRepository"));
const mailService_1 = __importDefault(require("../../services/mailService"));
const browseByActivity = async (req, res, next) => {
    try {
        const activityId = Number(req.query.id);
        const participants = await participationRepository_1.default.readAllParticipants(activityId);
        res.json(participants);
    }
    catch (err) {
        next(err);
    }
};
const browseUserActivity = async (req, res, next) => {
    try {
        const userId = Number(req.query.userId);
        if (!userId) {
            res.status(400).json({ message: "UserId is required" });
            return;
        }
        const activitiesUserEnrolled = await participationRepository_1.default.readUserActity(userId);
        if (activitiesUserEnrolled.length === 0) {
            res.sendStatus(204);
            return;
        }
        res.status(201).json(activitiesUserEnrolled);
    }
    catch (err) {
        next(err);
    }
};
const add = async (req, res, next) => {
    try {
        if (!req.auth.sub) {
            res.sendStatus(http_status_codes_1.StatusCodes.UNAUTHORIZED);
            return;
        }
        const response = await participationRepository_1.default.create(req.body);
        const mailData = await activityRepository_1.default.readWithOrganizer(req.body.activityId, req.body.userId);
        if (!mailData.visibility) {
            await mailService_1.default.sendInvitationEmail(mailData);
        }
        if (mailData.visibility) {
            await mailService_1.default.sendRequestEmail(mailData);
        }
        res.json(response);
    }
    catch (err) {
        if (err instanceof Error &&
            err.code === "ER_DUP_ENTRY") {
            res.status(http_status_codes_1.StatusCodes.CONFLICT).json({ error: "ALREADY_INVITED" });
        }
        next(err);
    }
};
const editStatus = async (req, res, next) => {
    try {
        if (!req.auth.sub) {
            res.sendStatus(http_status_codes_1.StatusCodes.UNAUTHORIZED);
            return;
        }
        const { userId, activityId, status, participantUsername, type } = req.body;
        const result = await participationRepository_2.default.update(userId, activityId, status);
        if ((status === "accepted" || status === "refused") &&
            type === "invitation") {
            const mailData = await activityRepository_1.default.readWithOrganizer(activityId, userId);
            await mailService_1.default.sendAnswerInvitationEmail(mailData, status);
        }
        if ((status === "accepted" || status === "refused") && type === "request") {
            const mailData = await activityRepository_1.default.readWithOrganizer(activityId, userId);
            await mailService_1.default.sendAnswerRequestEmail(mailData, status);
        }
        res.json({ message: "Participation updated", result });
    }
    catch (err) {
        next(err);
    }
};
exports.default = {
    add,
    browseUserActivity,
    editStatus,
    browseByActivity,
};
