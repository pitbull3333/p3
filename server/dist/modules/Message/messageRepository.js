"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../../database/client"));
class MessageRepository {
    async create(userId, activityId, content) {
        const result = client_1.default.query(`INSERT INTO messages (user_id, activity_id, content)
        VALUES(?, ?, ?)`, [userId, activityId, content]);
        return result;
    }
    async read(userId, activityId) {
        const rows = client_1.default.query(`SELECT m.*, u.username,
        COUNT(l.id) AS like_count
        FROM messages AS m
        JOIN user AS u ON m.user_id = u.id
        LEFT JOIN message_likes AS l ON m.id = l.message_id
      WHERE activity_id = ?
      GROUP BY m.id
      ORDER BY m.created_at ASC`, [activityId]);
        return rows;
    }
    async readSingle(messageId) {
        const rows = client_1.default.query(`SELECT m.*, u.username
        FROM messages AS m
        JOIN user AS u ON m.user_id = u.id
        WHERE m.id = ?`, [messageId]);
        return rows;
    }
    async createLike(messageId, userId) {
        const [result] = await client_1.default.query(`INSERT IGNORE INTO message_likes (message_id, user_id)
        VALUES (?, ?)`, [messageId, userId]);
        return result.affectedRows === 1;
    }
    async updateLikeCount(messageId) {
        const [result] = await client_1.default.query(`UPDATE messages SET like_count = like_count + 1
        WHERE messages.id = ?`, [messageId]);
        return { affectedRows: result.affectedRows };
    }
    async delete(userId, messageId) {
        const result = client_1.default.query(`DELETE FROM messages 
        WHERE id = ? AND user_id = ?`, [messageId, userId]);
        return result;
    }
}
exports.default = new MessageRepository();
