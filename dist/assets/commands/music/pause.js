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
        super('pause', {
            aliases: ['stop'],
            category: 'music',
            permissions: ["PRIORITY_SPEAKER"],
            description: 'Pauses the current song',
            usage: 'No arguments'
        });
        this.handler = handler;
    }
    run(message, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const musicData = this.handler.player.getMusicaData(message.guild.id);
            if (((_a = message.member) === null || _a === void 0 ? void 0 : _a.voice.channel) !== (musicData === null || musicData === void 0 ? void 0 : musicData.voiceChannel))
                return this.handler.error('You have to be in the same voice channel of the song', message.channel);
            if (!musicData)
                return this.handler.error('There is no song playing', message.channel);
            if (musicData.player.paused)
                return this.handler.error('The song is already paused', message.channel);
            musicData.player.pause();
            message.channel.send('The song has been paused');
        });
    }
};
