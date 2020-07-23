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
        super('resume', {
            aliases: ['res', 'continue'],
            category: 'music',
            description: 'Resume the current song',
            usage: 'No arguments'
        });
        this.handler = handler;
    }
    run(message, args) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const musicData = this.handler.player.getMusicaData(message.guild.id);
            if (((_a = message.member) === null || _a === void 0 ? void 0 : _a.voice.channel) !== ((_b = musicData) === null || _b === void 0 ? void 0 : _b.voiceChannel))
                return message.channel.send('You have to be in the same voice channel of the song');
            if (!musicData)
                return message.channel.send('There is no song playing');
            if (!musicData.player.paused)
                return message.channel.send('The song is not paused');
            musicData.player.resume();
            message.channel.send('The song has been resumed');
        });
    }
};
