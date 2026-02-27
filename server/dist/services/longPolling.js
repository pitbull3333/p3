"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LongPollManager {
    constructor() {
        this.waiting = {};
    }
    addWaiting(activityId, callback) {
        if (!this.waiting[activityId]) {
            this.waiting[activityId] = [];
        }
        this.waiting[activityId].push(callback);
    }
    removeWaiting(activityId, callback) {
        if (this.waiting[activityId]) {
            this.waiting[activityId] = this.waiting[activityId].filter((cb) => cb !== callback);
        }
    }
    notifyWaiting(activityId, message) {
        const waitingList = this.waiting[activityId] || [];
        const callbacks = waitingList;
        delete this.waiting[activityId];
        for (const callback of callbacks) {
            try {
                callback([message]);
            }
            catch (err) {
                console.error("Longpol callback failed");
            }
        }
        this.waiting[activityId] = [];
    }
}
exports.default = new LongPollManager();
