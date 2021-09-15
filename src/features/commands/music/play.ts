import Command from "../../../handlers/Command";
import { Message, MessageEmbed } from "discord.js";
import Youtube from "simple-youtube-api";
import { IArgs } from "../../../Utils";
import Handler from "../../../handlers/Handler";
import TextChannelCS from "../../../models/discord/TextChannel";
const youtube = new Youtube(process.env.YT_API);

module.exports = class extends Command {
    public handler: Handler;

    constructor({ handler }: IArgs) {
        super("play", {
            aliases: ["p"],
            category: "music",
            description: "Play a song or playlist",
            usage: "<Song name or YT url>",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const voiceChannel = message.member?.voice.channel;
        if (!voiceChannel) return channel.error("You have to be in a voice channel");

        this.handler.player.initPlayer(message.guild!.id, message, voiceChannel);
        const voiceChannelUsers = this.handler.player.getMusicData(message.guild!.id).voiceChannel;

        if (voiceChannelUsers && voiceChannel !== voiceChannelUsers)
            return channel.error("You have to be in the same channel with music");

        const userVideoIndex = args[0].match(/\$/g) ? parseInt(args.splice(0, 1)[0].substr(1)) : undefined;
        console.log(userVideoIndex);
        const query = args.join(" ");
        if (!query) return channel.error("Please give a song name or YT url");

        const musicData = this.handler.player.getMusicData(message.guild!.id);

        if (query.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/)) {
            // TODO
            return channel.error("Playlist are not supported");
        }

        if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
            const url = query;
            try {
                let newQuery = query.replace(/(>|<)/gi, "").split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
                const id = newQuery[2].split(/[^0-9a-z_\-]/i)[0];

                const video = await youtube.getVideoByID(id);
                if (!video) return channel.error("Failed to get video, try again");

                const title = video.title;
                let duration = this.formatDuration(video.duration);
                const thumbnail = video.thumbnails.high.url;
                if (duration === "00") duration = "Live stream";
                const song = {
                    url,
                    title,
                    duration,
                    thumbnail,
                    durationSec: video.duration,
                    skipVoteUsers: [],
                };

                // Here try/catch in not necessary. It already is in a try/catch
                await this.handler.player.add(message.guild!.id, message.member!, song);

                if (!musicData?.isPlaying) {
                    this.handler.player.play(message.guild!.id);
                    return channel.success(`\`${song.title}\` is ready to play`);
                } else {
                    return channel.info(`\`${song.title}\` has been added to queue`);
                }
            } catch (error) {
                this.handler.logger.error(`Error at getting song with yt link, link: ${url}`, error);
                console.log(error);
                return channel.error("Something went wrong try again later");
            }
        }

        // For query to search
        const videos: Array<any> = await youtube
            .searchVideos(query, 1)
            .then((response: any) => response)
            .catch(this.handler.logger.error);

        if (!videos) return channel.error("We have trouble finding your query please try again");
        if (videos.length < 1) return channel.error("No matches found");

        let video;
        try {
            video = await youtube.getVideoByID(videos[0].id);
            if (!video) return channel.error("Failed to get video, try again");
        } catch (err) {
            this.handler.logger.error(`Error at getting video by search, query: ${query}`, err);
            return channel.error("We have trouble finding your query please try again");
        }

        // Get video and data required to play;
        const url = `https://www.youtube.com/watch?v=${video.id}`;
        const title = video.title;
        let duration =
            this.formatDuration(video.duration) === "00" ? "Live Stream" : this.formatDuration(video.duration);
        const thumbnail = video.thumbnails.high.url;
        if (duration === "00") duration = "Live stream";
        const song = {
            url,
            title,
            duration,
            thumbnail,
            durationSec: video.duration,
            skipVoteUsers: [],
        };

        try {
            await this.handler.player.add(message.guild!.id, message.member!, song);
        } catch (error) {
            channel.error("There was a unexpected problem");
            return this.handler.logger.error(
                `Error at adding song: ${song.url}, guild: ${message.guild!.id}. Method: Search`,
                error,
            );
        }

        if (!musicData?.isPlaying) {
            this.handler.player.play(message.guild!.id);
            return;
        } else {
            const embed = new MessageEmbed()
                .setTitle("Song has been added to the queue")
                .setColor("GREEN")
                .setThumbnail(song.thumbnail)
                .addField("Title", `[${song.title}](${song.url})`)
                .addField("Duration", song.duration);

            message.channel.send(embed);

            return;
        }
    }

    private formatDuration(duration: any): string {
        const { hours, minutes, seconds } = duration;

        let durationString = "";

        if (hours > 0) durationString += `${hours}:`;
        if (minutes > 0) {
            const formated = minutes >= 10 ? minutes : `0${minutes}`;
            durationString += `${formated}:`;
        } else if (hours > 0) {
            durationString += "00:";
        }

        if (seconds > 0) {
            const formated = seconds >= 10 ? seconds : `0${seconds}`;
            durationString += `${formated}`;
        } else {
            durationString += "00";
        }

        return durationString;
    }
};
