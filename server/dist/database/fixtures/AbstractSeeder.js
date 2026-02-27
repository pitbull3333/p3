"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _AbstractSeeder_instances, _AbstractSeeder_doInsert;
Object.defineProperty(exports, "__esModule", { value: true });
// Import Faker library for generating fake data
const faker_1 = require("@faker-js/faker");
// Import database client
const client_1 = __importDefault(require("../client"));
const refs = {};
// Provide faker access through AbstractSeed class
class AbstractSeeder {
    constructor({ table, truncate = true, dependencies = [], }) {
        _AbstractSeeder_instances.add(this);
        this.table = table;
        this.truncate = truncate;
        this.dependencies = dependencies;
        this.promises = [];
        this.faker = faker_1.faker;
    }
    insert(data) {
        this.promises.push(__classPrivateFieldGet(this, _AbstractSeeder_instances, "m", _AbstractSeeder_doInsert).call(this, data));
    }
    run() {
        throw new Error("You must implement this function");
    }
    getRef(name) {
        return refs[name];
    }
}
_AbstractSeeder_instances = new WeakSet(), _AbstractSeeder_doInsert = async function _AbstractSeeder_doInsert(data) {
    // Extract ref name (if it exists)
    const { refName, ...values } = data;
    // Prepare the SQL statement: "insert into <table>(<fields>) values (<placeholders>)"
    const fields = Object.keys(values).join(",");
    const placeholders = new Array(Object.keys(values).length)
        .fill("?")
        .join(",");
    const sql = `insert into ${this.table}(${fields}) values (${placeholders})`;
    // Perform the query and if applicable store the insert id given the ref name
    const [result] = await client_1.default.query(sql, Object.values(values));
    if (refName != null) {
        const { insertId } = result;
        refs[refName] = { ...values, insertId };
    }
};
// Ready to export
exports.default = AbstractSeeder;
