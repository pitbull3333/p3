"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sportRepository_1 = __importDefault(require("./sportRepository"));
const browse = async (req, res, next) => {
    try {
        const sportName = req.query.name;
        const sports = await sportRepository_1.default.readAllBy(sportName);
        res.json(sports);
    }
    catch (err) {
        next(err);
    }
};
exports.default = { browse };
