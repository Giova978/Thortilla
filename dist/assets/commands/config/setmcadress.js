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
        super('setmcadress', {
            aliases: ['stmc'],
            permissions: ['ADMINISTRATOR'],
            category: 'config',
            description: 'Sets the ip for `getmcplayers` command',
            usage: '<ip>'
        });
        this.handler = handler;
    }
    run(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const guild = message.guild;
            if (!args[0]) {
                const address = guild.getMCAdress;
                if (address) {
                    return message.channel.send(`The current ip is \`${address}\``);
                }
                return message.channel.send('There is no ip');
            }
            guild.setMCAdress(args[0])
                .then((text) => message.channel.send(text))
                .catch(console.error);
        });
    }
};
