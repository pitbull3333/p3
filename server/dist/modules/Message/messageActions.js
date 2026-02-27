"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const messageRepository_1 = __importDefault(require("./messageRepository"));
const longPolling_1 = __importDefault(require("../../services/longPolling"));
const messageRepository_2 = __importDefault(require("./messageRepository"));
const http_status_codes_1 = require("http-status-codes");
const browse = async (req, res, next) => {
    const userId = req.auth?.sub ? Number(req.auth.sub) : null;
    const activityId = Number(req.query.activityId);
    try {
        const [messages] = await messageRepository_1.default.read(userId, activityId);
        res.status(200).json(messages);
    }
    catch (err) {
        next(err);
    }
};
const add = async (req, res, next) => {
    const { userId, activityId, content } = req.body;
    try {
        const [result] = await messageRepository_1.default.create(userId, activityId, content);
        if (result.affectedRows === 0) {
            res.status(400).json({ message: "Message Cannot be created" });
        }
        const [message] = await messageRepository_1.default.readSingle(result.insertId);
        const newMessage = message[0];
        longPolling_1.default.notifyWaiting(activityId.toString(), newMessage);
        res.status(201).json({ message: "Message Created", result });
    }
    catch (err) {
        next(err);
    }
};
const poll = async (req, res) => {
    const activityId = req.query.activityId;
    let timeoutId = null;
    let responseSent = false;
    const sendResponse = (messages) => {
        if (responseSent) {
            return;
        }
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        responseSent = true;
        res.json({ messages });
    };
    longPolling_1.default.addWaiting(activityId, sendResponse);
    timeoutId = setTimeout(() => {
        longPolling_1.default.removeWaiting(activityId, sendResponse);
        res.json({ messages: [] });
    }, 25000);
    req.on("close", () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        longPolling_1.default.removeWaiting(activityId, sendResponse);
    });
};
const addLike = async (req, res, next) => {
    try {
        const { messageId, userId } = req.body;
        const inserted = await messageRepository_2.default.createLike(messageId, userId);
        if (!inserted) {
            res
                .status(http_status_codes_1.StatusCodes.CONFLICT)
                .json({ error: "User already liked this message" });
            return;
        }
        const updatedCount = await messageRepository_2.default.updateLikeCount(messageId);
        if (!updatedCount) {
            res
                .status(http_status_codes_1.StatusCodes.CREATED)
                .json({ error: "Like count is not updated", success: false });
            return;
        }
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            success: true,
        });
    }
    catch (err) {
        next(err);
    }
};
const deleteMessage = async (req, res, next) => {
    const { userId, messageId } = req.body;
    const [deleteResult] = await messageRepository_1.default.delete(userId, messageId);
    if (deleteResult.affectedRows === 0) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "Message not found" });
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({ success: true });
};
exports.default = { add, browse, poll, addLike, deleteMessage };
