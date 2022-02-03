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
        const musicData = this.handler.player.getMusicData(message.guild!.id);
        const voiceChannelUsers = musicData.voiceChannel;

        // const chances = [...Array(19).fill(false), true];
        const chance = false; //chances[Math.floor(Math.random() * chances.length)];

        if (voiceChannelUsers && voiceChannel !== voiceChannelUsers)
            return channel.error("You have to be in the same channel with music");

        const query = args.join(" ");
        if (!query) return channel.error("Please give a song name or YT url");

        if (query.match(/^(?!.*\?.*\bv=)https:\/\/(www|music)\.youtube\.com\/.*\?.*\blist=.*$/)) {
            const id = query.split(/playlist\?list=/)[1].split(/[^0-9a-z_\-]/i)[0];
            const playlist = await youtube.getPlaylistByID(id);
            await playlist.getVideos();

            const msg = await channel.info("Playlist found, fetching songs...");

            const videos = await Promise.all(playlist.videos.map((video: any) => video.fetch()));

            const failed: string[] = [];
            let succeed = 0;

            for (const video of videos) {
                const song = {
                    url: `https://www.youtube.com/watch?v=${video.id}`,
                    title: video.title,
                    duration: this.formatDuration(video.duration),
                    thumbnail: video.thumbnails.high.url,
                    durationSec: video.duration,
                    skipVoteUsers: [],
                };

                try {
                    await this.handler.player.add(message.guild!.id, message.member!, song);
                    succeed++;
                } catch (error) {
                    failed.push(song.title);
                    this.handler.logger.error(`Failed to add song ${song.title} to queue: ${error}`);
                }
            }

            msg!.delete();

            if (succeed < 1) {
                return channel.error(`Failed to add the playlist to the queue`);
            }

            if (failed.length > 0)
                channel.error(`Failed to add the following songs to the queue: ${failed.join(", ")}`);

            if (!musicData?.isPlaying) {
                this.handler.player.play(message.guild!.id);
            }

            return channel.success(`Added ${succeed} songs to the queue`);
        }

        if (query.match(/^(http(s)?:\/\/)?((w){3}\.|music\.)?youtu(be|\.be)?(\.com)?\/.+/)) {
            const url = query;
            try {
                const id = query
                    .replace(/(>|<)/gi, "")
                    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)[2]
                    .split(/[^0-9a-z_\-]/i)[0];

                const video = await youtube.getVideoByID(id);
                if (!video) return channel.error("Failed to get video, try again");

                const title = video.title;
                let duration = this.formatDuration(video.duration);
                const thumbnail = video.thumbnails.high.url;
                if (duration === "00") duration = "Live stream";
                const song = {
                    url: `https://www.youtube.com/watch?v=${chance ? "dQw4w9WgXcQ" : video.id}`,
                    title,
                    duration,
                    thumbnail,
                    durationSec: video.duration,
                    skipVoteUsers: [],
                };

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
        const url = `https://www.youtube.com/watch?v=${chance ? "dQw4w9WgXcQ" : video.id}`;
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
            durationString += `00${minutes}:`.slice(-3);
        }

        if (seconds > 0) {
            durationString += `00${seconds}`.slice(-2);
        }

        return durationString;
    }
};
