"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables from .env file
require("dotenv/config");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
// Import database client
const client_1 = __importDefault(require("../database/client"));
const fixturesPath = node_path_1.default.join(__dirname, "../database/fixtures");
const seed = async () => {
    try {
        const dependencyMap = {};
        // Construct each seeder
        const filePaths = node_fs_1.default
            .readdirSync(fixturesPath)
            .filter((filePath) => !filePath.startsWith("Abstract"));
        for (const filePath of filePaths) {
            const { default: SeederClass } = await Promise.resolve(`${`file://${node_path_1.default.join(fixturesPath, filePath)}`}`).then(s => __importStar(require(s)));
            const seeder = new SeederClass();
            dependencyMap[SeederClass.toString()] = seeder;
        }
        // Sort seeders according to their dependencies
        const sortedSeeders = [];
        // The recursive solver
        const solveDependencies = (n) => {
            for (const DependencyClass of n.dependencies) {
                const dependency = dependencyMap[DependencyClass.toString()];
                if (!sortedSeeders.includes(dependency)) {
                    solveDependencies(dependency);
                }
            }
            if (!sortedSeeders.includes(n)) {
                sortedSeeders.push(n);
            }
        };
        // Solve dependencies for each seeder
        for (const seeder of Object.values(dependencyMap)) {
            solveDependencies(seeder);
        }
        // Truncate tables (starting from the depending ones)
        for (const seeder of sortedSeeders.slice().reverse()) {
            // Use delete instead of truncate to bypass foreign key constraint
            // Wait for the delete promise to complete
            await client_1.default.query(`delete from ${seeder.table}`);
        }
        // Run each seeder
        for (const seeder of sortedSeeders) {
            await seeder.run();
            // Wait for all the insertion promises to complete
            // We do want to wait in order to satisfy dependencies
            await Promise.all(seeder.promises);
        }
        // Close the database connection
        client_1.default.end();
        console.info(`${process.env.DB_NAME} filled from '${node_path_1.default.normalize(fixturesPath)}' 🌱`);
    }
    catch (err) {
        const { message, stack } = err;
        console.error("Error filling the database:", message, stack);
    }
};
// Run the seed function
seed();
