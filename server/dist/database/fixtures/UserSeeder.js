"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractSeeder_1 = __importDefault(require("./AbstractSeeder"));
class UserSeeder extends AbstractSeeder_1.default {
    constructor() {
        super({ table: "user", truncate: true });
    }
    run() {
        for (let i = 0; i < 50; i += 1) {
            const fakeUser = {
                email: this.faker.internet.email(),
                username: this.faker.internet.username(),
                password: this.faker.internet.password(),
                firstname: this.faker.person.firstName(),
                lastname: this.faker.person.lastName(),
                born_at: this.faker.date.birthdate(),
                address: this.faker.location.streetAddress(),
                city: this.faker.location.city(),
                zip_code: this.faker.location.zipCode("#####"),
                phone: this.faker.string.numeric(10),
                picture: this.faker.image.personPortrait(),
                refName: `user_${i}`,
            };
            this.insert(fakeUser);
        }
    }
}
exports.default = UserSeeder;
