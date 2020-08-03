"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../../handlers/Command"));
module.exports = class extends Command_1.default {
    constructor({ handler }) {
        super("toggle", {
            aliases: ["tg"],
            description: "Toggle the provided command",
            category: "debug",
            usage: "<Name or Alias> [command or event] Default: command",
        });
        this.handler = handler;
    }
    run(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.author.id !== process.env.OWNER)
                return this.handler.error("Command only for debug", message.channel, 1000);
            // The name of the command, event or feature
            const name = args[0];
            if (!name)
                return this.handler.error("Please give me a command, feature or event to toggle", message.channel);
            // The type (command, event or feature)
            const type = args[1];
            // Enabled / Disabled variable in string
            let stateInString;
            // Toggle the specified type command, event or feature
            // If isn't specified then toggle a command
            switch (type) {
                case "event":
                    const events = this.handler.events.get(name);
                    if (!events)
                        return this.handler.error("I can't found the events", message.channel);
                    events.map((event) => {
                        event.toogle();
                    });
                    stateInString = events[0].enabled ? "`enabled`" : "`disabled`";
                    message.channel.send(`Events \`${name}\` are now ${stateInString}`);
                    break;
                default:
                    // Toggle a command
                    const command = this.handler.commands.get(name) || this.handler.aliases.get(name);
                    if (!command)
                        return this.handler.error("I can't found the command", message.channel);
                    command.toogle();
                    stateInString = command.enabled ? "`enabled`" : "`disabled`";
                    message.channel.send(`Command \`${name}\` is now ${stateInString}`);
                    break;
            }
        });
    }
};
