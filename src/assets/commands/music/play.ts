import Command from "../../../handlers/Command";
import { Message, MessageEmbed } from "discord.js";
import Youtube from "simple-youtube-api";
import { IArgs, Utils } from "../../../Utils";
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
            usage: "<Song name or YT url or playlist url>",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const voiceChannel = message.member?.voice.channel;
        if (!voiceChannel) return channel.error("You has to be in a voice channel");

        this.handler.player.initPlayer(message.guild!.id, message, voiceChannel);
        const voiceChannelUsers = this.handler.player.getMusicaData(message.guild!.id).voiceChannel;

        if (voiceChannelUsers && voiceChannel !== voiceChannelUsers)
            return channel.error("You have to be in the same channel with music");

        const query = args.join(" ");
        if (!query) return channel.error("Please give a song name or YT url>");

        const musicData = this.handler.player.getMusicaData(message.guild!.id);

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

                await this.handler.player.add(message.guild!.id, message, song);

                if (!musicData?.isPlaying) {
                    this.handler.player.play(message.guild!.id);
                    return channel.success(`\`${song.title}\` is ready to play`);
                } else {
                    return channel.info(`\`${song.title}\` has been added to queue`);
                }
            } catch (error) {
                console.error(error);
                return channel.error("Something went wrong try again later");
            }
        }

        // For query to search
        const videos: Array<any> = await youtube
            .searchVideos(query)
            .then((response: any) => response)
            .catch((error: any) => console.error(error));

        if (!videos) return channel.error("We have trouble finding your query please try again");

        const videosNames: string[] = [];

        for (let i = 0; i < videos.length; i++) {
            videosNames.push(`${i + 1}: ${videos[i].title}`);
        }

        if (videos.length < 1) return channel.error("No matches found");

        // Send embed to select song
        const embed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle("Choose a song by comment a number beetween 1 and 5 or exit to exit");

        for (let i = 0; i < videosNames.length; i++) {
            embed.addField(`Song ${i + 1}`, `${videosNames[i]}`);
        }

        const songEmbed = await message.channel.send(embed);

        // Fetch response from user
        const filter = (m: Message) => +m.content <= 5 || (m.content === "exit" && m.author.id === message.author.id);

        const userResponse = await message.channel
            .awaitMessages(filter, {
                max: 1,
                maxProcessed: 1,
                time: 60000,
                errors: ["time"],
            })
            .then((r) => r)
            .catch((err) => {
                console.error(err);
                songEmbed.delete();
                return channel.error("Please try again and enter a number beetween 1 and 5 or exit");
            });
        // @ts-ignore
        if (userResponse.size === 0) {
            songEmbed.delete();
            return channel.error("Please try again and enter a number beetween 1 and 5 or exit");
        }
        // @ts-ignore
        const videoIndex = parseInt(userResponse.first().content);

        // Work the response from the user
        // @ts-ignore
        if (userResponse.first().content === "exit") return songEmbed.delete();
        try {
            var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
            if (!video) return channel.error("Failed to get video, try again");
        } catch (err) {
            console.error(err);
            songEmbed.delete();
            return channel.error("We have trouble finding your query please try again");
        }

        // @ts-expect-error
        userResponse.first().delete();

        // Get video and data required to play;
        const url = `https://www.youtube.com/watch?v=${video.id}`;
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

        await this.handler.player.add(message.guild!.id, message, song);

        if (!musicData?.isPlaying) {
            this.handler.player.play(message.guild!.id);
            return songEmbed.delete();
        } else {
            const embed = new MessageEmbed()
                .setTitle("Song has been added to the queue")
                .setColor("GREEN")
                .setThumbnail(song.thumbnail)
                .addField("Title", `[${song.title}](${song.url})`)
                .addField("Duration", song.duration);

            message.channel.send(embed);

            return songEmbed.delete();
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
