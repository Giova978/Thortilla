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
        super('timestamp', {
            aliases: ['seek', 'ts'],
            category: 'music',
            description: 'Skips to the gived timestamp',
            usage: '<timestamp(formata m:s)>'
        });
        this.handler = handler;
    }
    run(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const musicData = this.handler.player.getMusicaData(message.guild.id);
            if (!musicData)
                return message.channel.send('There is no song playing');
            const time = args[0];
            if (!time)
                return message.channel.send('Give a timestamp');
            const [minutes, seconds] = time.split(':');
            if (!minutes)
                return message.channel.send('Give a good formated timestamp');
            if (!time)
                return message.channel.send('Give a good formated timestamp');
            const timeToSkip = ((parseInt(minutes) * 60) + parseInt(seconds)) * 1000;
            musicData.player.seek(timeToSkip);
            message.channel.send(`Skipped to ${time}`);
        });
    }
};
