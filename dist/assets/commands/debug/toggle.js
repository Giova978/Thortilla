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
const Utils_1 = require("../../../Utils");
module.exports = class extends Command_1.default {
    constructor({ handler }) {
        super("toggle", {
            aliases: ["tg"],
            description: "Toogle the provided command",
            category: "debug",
            usage: "<Name or Alias> [command, feature or event] Default: command",
        });
        this.handler = handler;
    }
    run(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.author.id !== process.env.OWNER)
                return message.channel.send("Command olny for debug").then((msg) => Utils_1.Utils.deleteMessage(msg, 1000));
            // The name of the command, event or feauture
            const name = args[0];
            if (!name)
                return message.channel.send("Please give me a command, feature or event to toogle").then(Utils_1.Utils.deleteMessage);
            // The type (command, event or feauture)
            const type = args[1];
            // Enabled / Disabled variable in string
            let stateInString;
            // Toogle the specified type command, event or feauture
            // If isn't specified then toogle a command
            switch (type) {
                case "event":
                    const events = this.handler.events.get(name);
                    if (!events)
                        return message.channel.send("I can't found the events");
                    events.map((event) => {
                        event.toogle();
                    });
                    stateInString = events[0].enabled ? "`enabled`" : "`disabled`";
                    message.channel.send(`Events \`${name}\` are now ${stateInString}`);
                    break;
                default:
                    // Toogle a command
                    const command = this.handler.commands.get(name) || this.handler.aliases.get(name);
                    if (!command)
                        return message.channel.send("I can't found the command");
                    command.toogle();
                    stateInString = command.enabled ? "`enabled`" : "`disabled`";
                    message.channel.send(`Command \`${name}\` is now ${stateInString}`);
                    break;
            }
        });
    }
};
