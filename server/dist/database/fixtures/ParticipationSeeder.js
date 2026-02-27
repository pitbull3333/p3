"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractSeeder_1 = __importDefault(require("./AbstractSeeder"));
const ActivitySeeder_1 = __importDefault(require("./ActivitySeeder"));
const UserSeeder_1 = __importDefault(require("./UserSeeder"));
class ParticipationSeeder extends AbstractSeeder_1.default {
    constructor() {
        super({
            table: "participation",
            truncate: true,
            dependencies: [UserSeeder_1.default, ActivitySeeder_1.default],
        });
    }
    run() {
        const statusArray = ["request", "inviting", "accepted", "refused"];
        for (let i = 0; i < 50; i += 1) {
            const randomActivity = Math.floor(Math.random() * 22);
            const fakeParticipation = {
                user_id: this.getRef(`user_${i}`).insertId,
                activity_id: this.getRef(`activity_${randomActivity}`).insertId,
                status: statusArray[Math.floor(statusArray.length * Math.random())],
                created_at: this.faker.date.soon(),
                updated_at: this.faker.date.future(),
            };
            this.insert(fakeParticipation);
        }
    }
}
exports.default = ParticipationSeeder;
