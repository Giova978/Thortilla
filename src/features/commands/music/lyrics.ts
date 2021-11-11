import Command from "../../../handlers/Command";
import { Message, MessageEmbed, Util } from "discord.js";
import Handler from "../../../handlers/Handler";
import { IArgs } from "../../../Utils";
import TextChannelCS from "../../../models/discord/TextChannel";
// @ts-expect-error
import { getLyrics } from "genius-lyrics-api";

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super("lyrics", {
            category: "music",
            description: "Gets lyrics for the current song",
            usage: "No arguments",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const musicData = this.handler.player.getMusicData(message.guild!.id);
        if (message.member?.voice.channel !== musicData?.voiceChannel)
            return channel.error("You have to be in the same voice channel of the song");
        if (!musicData) return channel.error("There is no song playing");
        if (!musicData.nowPlaying) return channel.error("There is no song playing");

        const cleanedTitle = this.cleanTitle(musicData.nowPlaying!.title);

        const [title, artist] = [cleanedTitle.substr(0, 3), cleanedTitle.substr(3)];

        console.log(title, artist);
        let lyrics;
        const options = {
            apiKey: process.env.GENIUS_API_KEY,
            title,
            artist,
        };
        try {
            lyrics = await getLyrics(options);
        } catch (e) {
            this.handler.logger.error(`Error at fetching lyrics for title: ${musicData.nowPlaying?.title}\n${e}`);
            return channel.error("An error occurred while fetching the lyrics");
        }

        const text = Util.splitMessage(lyrics, { maxLength: 2000 });

        const lyricsEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(text)
            .setTitle(`Lyrics for ${cleanedTitle}`);

        channel.send(lyricsEmbed);
    }

    private cleanTitle(title: string) {
        const firstBracket = title.indexOf("(");
        const lastBracket = title.indexOf(")");

        return title.substr(0, firstBracket) + title.substr(lastBracket + 1);
    }
};
