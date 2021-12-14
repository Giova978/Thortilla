import Command from "../../../handlers/Command";
import { Message, MessageEmbed, Util } from "discord.js";
import Handler from "../../../handlers/Handler";
import { IArgs } from "../../../Utils";
import TextChannelCS from "../../../models/discord/TextChannel";
import axios from "axios";
import { load } from "cheerio";

module.exports = class extends Command {
    private readonly handler: Handler;
    private readonly apiUrl: string;

    constructor({ handler }: IArgs) {
        super("lyrics", {
            category: "music",
            description: "Gets lyrics for the current song",
            usage: "[ Song name ]",
        });

        this.handler = handler;
        this.apiUrl = "https://www.musixmatch.com";
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        let songName = args.join(" ");

        if (!songName) {
            const musicData = this.handler.player.getMusicData(message.guild!.id);
            if (message.member?.voice.channel !== musicData?.voiceChannel)
                return channel.error("You have to be in the same voice channel of the song");
            if (!musicData) return channel.error("There is no song playing");
            if (!musicData.nowPlaying) return channel.error("There is no song playing");

            songName = this.cleanTitle(musicData.nowPlaying!.title);
        }

        const songLink = await this.getBestResult(songName);

        if (!songLink) return channel.info("No lyrics found. Maybe try by searching with the song and artist name?");

        const lyrics = await this.getLyrics(songLink);
        if (!lyrics) return channel.error("No lyrics found, try again");

        const text = Util.splitMessage(lyrics, { maxLength: 2000 });

        const lyricsEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(text)
            .setTitle(`Lyrics for ${songName}`);

        channel.send(lyricsEmbed);
    }

    private async getBestResult(title: string) {
        const endpoint = `${this.apiUrl}/search/${title}`;

        let song;
        try {
            const response = await axios.get(endpoint);
            const $ = load(response.data);
            song =
                this.apiUrl +
                $(
                    ".main-panel > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > h2:nth-child(1) > a:nth-child(1)",
                ).attr("href");
        } catch (e) {
            this.handler.logger.error(`Error at initial search for title: ${title}\n${e}`);
            song = "";
        }

        return song;
    }

    private async getLyrics(url: string) {
        let lyrics;
        try {
            const response = await axios.get(url);
            const $ = load(response.data);
            const text = $(".col-ml-6 > div:nth-child(1) > span:nth-child(3) span").map((i, el) => $(el).text());

            lyrics = text.toArray().join("\n");
        } catch (error) {
            this.handler.logger.error(`Error at fetching lyrics for url: ${url}\n${error}`);
            lyrics = "";
        }

        return lyrics;
    }

    private cleanTitle(title: string) {
        const firstBracket = title.indexOf("(");
        const lastBracket = title.indexOf(")");

        return title.substr(0, firstBracket) + title.substr(lastBracket + 1);
    }
};
