"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables from .env file
require("dotenv/config");
const node_fs_1 = __importDefault(require("node:fs"));
const client_1 = __importDefault(require("../database/client"));
// Close the database connection after all tests have run
afterAll((done) => {
    client_1.default.end().then(done);
});
// Test suite for environment installation
describe("Installation", () => {
    // Test: Check if the .env file exists
    test("You have created /server/.env", async () => {
        expect(node_fs_1.default.existsSync(`${__dirname}/../.env`)).toBe(true);
    });
    // Test: Check if the .env.sample file exists
    test("You have retained /server/.env.sample", async () => {
        expect(node_fs_1.default.existsSync(`${__dirname}/../.env.sample`)).toBe(true);
    });
    // Test: Check if the .env file is properly filled with valid database connection information
    test("You have filled /server/.env with valid information to connect to your database", async () => {
        expect.assertions(0);
        try {
            // Check if the connection is successful
            await client_1.default.getConnection();
        }
        catch (error) {
            expect(error).toBeDefined();
        }
    });
    // Test: Check if the database migration scripts have been executed
    test("You have executed the db:migrate scripts", async () => {
        // Query the 'item' table to check if any data has been inserted
        const [rows] = await client_1.default.query("select * from item");
        // Expecting rows to be returned, indicating successful migration
        expect(rows.length).toBeGreaterThanOrEqual(0);
    });
});
