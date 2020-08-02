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
const axios_1 = __importDefault(require("axios"));
const discord_js_1 = require("discord.js");
module.exports = class extends Command_1.default {
    constructor() {
        super('subreddit', {
            aliases: ['sub'],
            category: 'fun',
            description: 'Sends content from the specified subreddit',
            usage: '<subreddit>'
        });
    }
    run(messsage, args) {
        return __awaiter(this, void 0, void 0, function* () {
            messsage.delete();
            const subreddit = args[0];
            if (!subreddit)
                return messsage.channel.send('Give me a valid subreddit please');
            let data;
            try {
                let response = yield axios_1.default.get(`https://www.reddit.com/r/${subreddit}/hot.json`);
                data = response.data.data;
            }
            catch (error) {
                console.error(error);
            }
            if (!data)
                return messsage.channel.send('No data found');
            const collectorFilter = (reaction, user) => reaction.emoji.name === '⬅️' || reaction.emoji.name === '➡️' || reaction.emoji.name === '🇽' && user.id === messsage.author.id;
            const embed = new discord_js_1.MessageEmbed().setTitle('Image');
            // The actual image for the embed
            let index = 0;
            embed.setImage(data.children[index].data.url);
            const msg = yield messsage.channel.send(embed);
            yield Promise.all([
                msg.react('⬅️'),
                msg.react('➡️'),
                msg.react('🇽'),
            ]);
            const collector = msg.createReactionCollector(collectorFilter, { time: 120000 });
            collector.on('collect', (reaction, reactionCollector) => {
                const newEmbed = new discord_js_1.MessageEmbed()
                    .setTitle('Image');
                if (reaction.emoji.name === '⬅️') {
                    index = index-- <= 0 ? 0 : index--;
                    newEmbed.setImage(data.children[index].data.url);
                    msg.edit(newEmbed);
                }
                if (reaction.emoji.name === '➡️') {
                    index = index++ >= data.children.length ? data.children.length : index++;
                    newEmbed.setImage(data.children[index].data.url);
                    msg.edit(newEmbed);
                }
                if (reaction.emoji.name === '🇽') {
                    collector.stop();
                }
            });
            collector.on('end', collected => {
                msg.delete();
                console.log('Ended');
                console.log(collected.size);
            });
        });
    }
};
