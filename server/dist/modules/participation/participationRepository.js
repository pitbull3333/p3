"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../../database/client"));
class participationRepository {
    async readAllParticipants(activityId) {
        const [rows] = await client_1.default.query(`SELECT participation.id, participation.status, user.id as userId, user.username, user.picture FROM participation
      JOIN user ON participation.user_id = user.id
      WHERE participation.activity_id = ?
      ORDER BY FIELD(participation.status, 'request', 'accepted', 'inviting', 'refused')`, [activityId]);
        return rows;
    }
    async create(newParticipant) {
        const [Result] = await client_1.default.query(`INSERT INTO participation (status, user_id, activity_id)
        VALUES ('${newParticipant.status}', ${newParticipant.userId}, ${newParticipant.activityId})`);
        return Result;
    }
    async readUserActity(userId) {
        const [rows] = await client_1.default.query(`SELECT DISTINCT a.id, u.username, a.playing_at, a.city, s.name AS sport_name, p.status 
        FROM participation AS p
        JOIN activity AS a ON a.id = p.activity_id
        JOIN sport AS s ON s.id = a.sport_id
        JOIN user AS u ON a.user_id = u.id
        WHERE p.user_id = ? AND p.status = 'accepted' 
        OR a.user_id = ?
        ORDER BY playing_at ASC`, [userId, userId]);
        return rows;
    }
    async update(userId, activityId, status) {
        const [result] = await client_1.default.query(`UPDATE participation SET status = ?, updated_at = NOW()
       WHERE user_id = ? AND activity_id = ?`, [status, userId, activityId]);
        return result;
    }
}
exports.default = new participationRepository();
