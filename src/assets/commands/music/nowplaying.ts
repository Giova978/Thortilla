import Command from "../../../handlers/Command";
import { Message, MessageEmbed } from "discord.js";
import { stripIndent } from "common-tags";
import { IArgs, IMusicaData, Song } from "../../../Utils";
import Handler from "../../../handlers/Handler";

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super("nowplaying", {
            aliases: ["np"],
            category: "music",
            description: "Show info of current song",
            usage: "No arguments",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[]) {
        const musicData = this.handler.player.getMusicaData(message.guild!.id);
        if (!musicData || !musicData.nowPlaying) return this.handler.error("There is no song playing", message.channel);

        const song = musicData.nowPlaying;

        let description;

        if (song?.duration === "Live stream") {
            description = "Live stream";
        } else {
            description = this.getDurationBar(musicData, song!);
        }

        const embed = new MessageEmbed().setTitle("Current song").setColor("GREEN").setDescription(description);

        message.channel.send(embed);
    }

    private getDurationBar(musicData: IMusicaData, song: Song): string {
        const currentTimeMS = musicData.player.position;
        const currentTime = {
            seconds: Math.floor(currentTimeMS / 1000),
            minutes: Math.floor(currentTimeMS / (1000 * 60)),
            hours: Math.floor(currentTimeMS / (1000 * 60 * 60)),
        };

        const durationFormmatted = this.formatDuration(currentTime);
        let tempDescription = stripIndent`
                                **[${song.title}](${song.url})**

                                ${durationFormmatted}  `;
        const timePassedPer = Math.floor((currentTime.seconds / this.getRawDuration(song.durationSec)) * 20);

        for (let i = 0; i < 20; i++) {
            if (i === timePassedPer || (i === 0 && timePassedPer < 1)) {
                tempDescription += "🔘";
                continue;
            }

            tempDescription += "▬";
        }
        tempDescription += ` ${song.duration}`;
        return tempDescription;
    }

    private formatDuration(duration: any): string {
        if (duration.seconds === 0) return "00:00";
        let { hours, minutes, seconds } = duration;
        seconds = seconds - minutes * 60;
        minutes = minutes - hours * 60;

        let durationString = "";

        if (hours > 0) duration += `${hours}:`;

        let formated = minutes >= 10 ? minutes : `0${minutes}`;
        durationString += `${formated}:`;

        formated = seconds >= 10 ? seconds : `0${seconds}`;
        durationString += `${formated}`;

        return durationString;
    }

    private getRawDuration(duration: any): number {
        const { hours, minutes, seconds } = duration;

        return hours * 60 * 60 + minutes * 60 + seconds;
    }
};
