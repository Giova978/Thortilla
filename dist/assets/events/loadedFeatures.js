"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = __importDefault(require("../../handlers/Event"));
const ascii_table_1 = __importDefault(require("ascii-table"));
module.exports = class extends Event_1.default {
    constructor({ handler }) {
        super("ready", "required");
        this.Commands = new ascii_table_1.default("Commands");
        this.Events = new ascii_table_1.default("Events");
        this.handler = handler;
        this.Commands.setHeading("Command", "Status", "Enabled");
        this.Events.setHeading("Event", "Status", "Enabled");
    }
    run() {
        this.handler.commands.map((command) => {
            this.Commands.addRow(command.name, "Loaded", command.enabled);
        });
        this.handler.events.map((events, eventName) => {
            this.Events.addRow(eventName, "Loaded", events[0].enabled);
        });
        console.log(this.Commands.toString());
        console.log(this.Events.toString());
    }
};
