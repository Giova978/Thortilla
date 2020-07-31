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
        super('setprefix', {
            aliases: ['stp'],
            permissions: ['MANAGE_GUILD'],
            category: 'config',
            description: 'Sets the prefix for the current guild or gets the prefix',
            usage: '[prefix]'
        });
        this.handler = handler;
    }
    run(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const guild = message.guild;
            const prefix = args[0];
            if (!prefix)
                return message.channel.send(`The current prefix is ${guild.getPrefix}`);
            guild.setPrefix(prefix)
                .then((text) => message.channel.send(text))
                .catch(console.error);
        });
    }
};
