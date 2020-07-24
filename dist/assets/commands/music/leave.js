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
const lavajs_1 = require("@anonymousg/lavajs");
module.exports = class extends Command_1.default {
    constructor({ handler }) {
        super("leave", {
            aliases: ["l"],
            category: "music",
            description: "Shows the current queue",
            usage: "No arguments",
        });
        this.handler = handler;
    }
    run(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const musicData = this.handler.player.getMusicaData(message.guild.id);
            if (!musicData)
                return message.channel.send("I am not in a voicechannel");
            musicData.player.destroy();
            // @ts-ignore
            new lavajs_1.LavaNode(this.handler.lavaClient, this.handler.nodes[0]).wsSend({
                op: "leave",
                guil_id: message.guild.id,
            });
            this.handler.player.guildsMusicData.delete(message.guild.id);
            return message.channel.send("Bye have a great time");
        });
    }
};
