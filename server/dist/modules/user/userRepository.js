"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../../database/client"));
class userRepository {
    async readByEmail(email) {
        const [rows] = await client_1.default.query("SELECT user.id, user.username, user.picture, user.password, user.email FROM user WHERE user.email = ?", [email]);
        return rows[0];
    }
    async readById(id) {
        const [rows] = await client_1.default.query("SELECT id, email, username, firstname, lastname, born_at, address, city, zip_code, phone, picture FROM user WHERE id = ?", [id]);
        return rows[0];
    }
    async create(newUser) {
        const [result] = await client_1.default.query(`INSERT INTO user (
      username,
      password,
      email,
      firstName,
      lastName,
      born_at,
      address,
      city,
      zip_code,
      phone,
      picture
      )
      VALUES (? , ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            newUser.username,
            newUser.password,
            newUser.email,
            newUser.firstname,
            newUser.lastname,
            newUser.born_at,
            newUser.address,
            newUser.city,
            newUser.zip_code,
            newUser.phone,
            newUser.picture,
        ]);
        return result;
    }
}
exports.default = new userRepository();
