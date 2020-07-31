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
        super('volume', {
            aliases: ['v'],
            category: 'music',
            description: 'Skips to the gived timestamp',
            usage: '<timestamp(formata m:s)>',
        });
        this.disbale();
        this.handler = handler;
    }
    run(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const musicData = this.handler.player.getMusicaData(message.guild.id);
            if (!musicData)
                return message.channel.send('There is no song playing');
            const volume = parseInt(args[0]);
            if (isNaN(volume))
                return message.channel.send('Give a valid  volume');
            if (volume > 100)
                return message.channel.send('Give a valid  volume');
            if (volume < 1)
                return message.channel.send('Give a valid  volume');
            musicData.player.setVolume(volume);
            musicData.volume = volume;
            message.channel.send(`Volume is ${volume}`);
        });
    }
};
