"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Toggleable_1 = __importDefault(require("./Toggleable"));
class Event extends Toggleable_1.default {
    constructor(eventName, category) {
        super();
        this.eventName = eventName;
        this.category = category;
    }
    run(...args) {
        throw new Error(`${this.eventName} doesnt have any run method`);
    }
}
exports.default = Event;
