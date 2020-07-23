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
        super('setbalance', {
            aliases: ['stb'],
            permissions: ['ADMINISTRATOR'],
            category: 'config',
            description: 'Sets the balance of a user',
            usage: '<user> <quantity>'
        });
        this.handler = handler;
    }
    run(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = (Utils_1.Utils.getMember(message, args[0]) || message.member);
            if (!member)
                return message.channel.send('Please give a user');
            const newBalance = +args[0];
            if (isNaN(newBalance))
                return message.channel.send('Please give a valid number');
            member.setBalance(newBalance)
                .then(() => {
                message.channel.send('Balance changed successfully');
            })
                .catch(err => {
                message.channel.send('Something went wrong, please try again later');
                console.error(err);
            });
        });
    }
};
