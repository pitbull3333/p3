"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables from .env file
require("dotenv/config");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
// Build the path to the schema SQL file
const schema = node_path_1.default.join(__dirname, "../../server/database/schema.sql");
// Get database connection details from .env file
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
// Update the database schema
const promise_1 = __importDefault(require("mysql2/promise"));
const migrate = async () => {
    try {
        // Read the SQL statements from the schema file
        const sql = node_fs_1.default.readFileSync(schema, "utf8");
        // Create a specific connection to the database
        const database = await promise_1.default.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
            multipleStatements: true, // Allow multiple SQL statements
        });
        // Drop the existing database if it exists
        await database.query(`drop database if exists ${DB_NAME}`);
        // Create a new database with the specified name
        await database.query(`create database ${DB_NAME}`);
        // Switch to the newly created database
        await database.query(`use ${DB_NAME}`);
        // Execute the SQL statements to update the database schema
        await database.query(sql);
        // Close the database connection
        database.end();
        console.info(`${DB_NAME} updated from '${node_path_1.default.normalize(schema)}' 🆙`);
    }
    catch (err) {
        const { message, stack } = err;
        console.error("Error updating the database:", message, stack);
    }
};
// Run the migration function
migrate();
