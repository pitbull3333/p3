"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const participationRepository_1 = __importDefault(require("../participation/participationRepository"));
const activityRepository_1 = __importDefault(require("../activity/activityRepository"));
const mailService_1 = __importDefault(require("../../services/mailService"));
const add = async (req, res, next) => {
    try {
        if (!req.auth.sub) {
            res.sendStatus(http_status_codes_1.StatusCodes.UNAUTHORIZED);
            return;
        }
        const { activity, guests } = req.body;
        if (!activity.visibility && guests.length === 0) {
            res.status(http_status_codes_1.StatusCodes.UNPROCESSABLE_ENTITY).json({
                error: "Une activité privée doit avoir au moins un participant",
            });
            return;
        }
        const activityId = await activityRepository_1.default.create(activity);
        const newsParticipants = guests.map((guest) => ({
            userId: guest.id,
            activityId: activityId,
            status: "inviting",
        }));
        if (!activity.visibility) {
            for (const newParticipant of newsParticipants) {
                await participationRepository_1.default.create(newParticipant);
                const mailData = await activityRepository_1.default.readWithOrganizer(activityId, newParticipant.userId);
                await mailService_1.default.sendInvitationEmail(mailData);
            }
        }
        res.status(http_status_codes_1.StatusCodes.CREATED).json();
        return;
    }
    catch (err) {
        next(err);
    }
};
const browse = async (req, res, next) => {
    try {
        const page = Number.parseInt(req.query.page, 10) || 1;
        const limit = Number.parseInt(req.query.limit, 10) || 10;
        const userId = req.auth?.sub ? Number(req.auth.sub) : null;
        const filters = req.query.filters && JSON.parse(req.query.filters);
        const sort = req.query.sort && JSON.parse(req.query.sort);
        const { activities, totalActivities, totalPages } = await activityRepository_1.default.readAll(page, limit, filters, userId, sort);
        res.json({
            activities: activities,
            pagination: {
                page,
                limit,
                totalActivities,
                totalPages,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
const browseMine = async (req, res, next) => {
    try {
        if (!req.auth.sub) {
            res.sendStatus(http_status_codes_1.StatusCodes.UNAUTHORIZED);
            return;
        }
        const userId = Number(req.auth.sub);
        const status = req.query.status;
        const activities = await activityRepository_1.default.readAllByUserAndStatus(userId, status);
        res.status(http_status_codes_1.StatusCodes.OK).json(activities);
    }
    catch (err) {
        next(err);
    }
};
const read = async (req, res, next) => {
    try {
        const activityId = Number(req.params.id);
        const activity = await activityRepository_1.default.readOne(activityId);
        if (!activity) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "Activity not found" });
            return;
        }
        res.json(activity);
    }
    catch (err) {
        next(err);
    }
};
const verifyNbAvaiableSpots = async (req, res, next) => {
    try {
        const activityId = req.body.activityId;
        const activity = await activityRepository_1.default.readOne(activityId);
        if (activity?.nb_participant === activity?.nb_spots) {
            res.status(http_status_codes_1.StatusCodes.CONFLICT).json({
                error: "ACTIVITY_FULL",
            });
            return;
        }
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.default = { add, browse, browseMine, read, verifyNbAvaiableSpots };
