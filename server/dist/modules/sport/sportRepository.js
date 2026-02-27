"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../../database/client"));
class SportRepository {
    async readAllBy(sportName) {
        let query = "";
        if (sportName) {
            query += "WHERE name LIKE ?";
        }
        const [rows] = await client_1.default.query(`SELECT id, name FROM sport ${query} ORDER BY name`, [`${sportName}%`]);
        return rows;
    }
}
exports.default = new SportRepository();
