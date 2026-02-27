"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables from .env file
require("dotenv/config");
// Check database connection
// Note: This is optional and can be removed if the database connection
// is not required when starting the application
require("./database/checkConnection");
// Import the Express application from ./app
const app_1 = __importDefault(require("./app"));
// Get the port from the environment variables
//const port = process.env.APP_PORT;
const port = process.env.PORT || 3310;
// Start the server and listen on the specified port
app_1.default
    .listen(port, () => {
    console.info(`Server is listening on port ${port}`);
})
    .on("error", (err) => {
    console.error("Error:", err.message);
});
