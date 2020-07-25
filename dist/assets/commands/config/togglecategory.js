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
        super("togglecategory", {
            aliases: ["togglemodule", "tgcat"],
            permissions: ["ADMINISTRATOR"],
            category: "config",
            description: "Toggle certain category of commands and events",
            usage: "<category> <on or off>",
        });
        this.handler = handler;
    }
    run(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const module = args[0];
            if (!module || module === "config")
                return message.channel.send("Please provide a valid category");
            const stateString = args[1];
            if (!stateString || !["on", "off"].includes(stateString))
                return message.channel.send("Please provide a valid state");
            const guild = message.guild;
            const modules = guild.getModulesStatus();
            const modulesKeys = Object.keys(modules);
            if (!modulesKeys.includes(module))
                return message.channel.send("Please provide a valid category");
            const state = stateString === "on" ? true : false;
            modules[module] = state;
            guild
                .setModulesStatus(modules)
                .then(() => {
                return message.channel.send(`Successfully changed \`${module}\` to \`${stateString}\``);
            })
                .catch((err) => {
                return message.channel.send("An error ocurred while changing module status, please try again later");
            });
        });
    }
};
