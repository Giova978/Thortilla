import Command from "../../../handlers/Command";
import { Message, MessageEmbed } from "discord.js";
import Youtube from "simple-youtube-api";
import { IArgs } from "../../../Utils";
import Handler from "../../../handlers/Handler";
import TextChannelCS from "../../../models/discord/TextChannel";
const youtube = new Youtube(process.env.YT_API);

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super("search", {
            aliases: ["sc"],
            category: "music",
            description: "Search for a song",
            usage: "<Song name>",
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

        const videos: Array<any> = await youtube
            .searchVideos(query)
            .then((response: any) => response)
            .catch(this.handler.logger.error);

        if (!videos) return channel.error("We have trouble finding your query please try again");
        if (videos.length < 1) return channel.error("No matches found");

        let videoIndex = userVideoIndex;
        const videosNames = videos.map((video, i) => `${i + 1}: ${video.title}`);

        // Send embed to select song
        const embed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle("Choose a song with a number between 1 and 5 or exit to exit")
            .addFields(
                videosNames.map((name, i) => ({
                    name: `Song ${i + 1}`,
                    value: `${name}`,
                })),
            );

        const songEmbed = await message.channel.send(embed);

        // Fetch response from user
        const filter = (m: Message) => m.author.id === message.author.id && (m.content === "exit" || +m.content <= 5);

        const userResponse = await message.channel
            .awaitMessages(filter, {
                max: 1,
                time: 60000,
                errors: ["time"],
            })
            .catch((err) => {
                return Promise.reject(false);
            });

        if (!userResponse || userResponse.size === 0) {
            songEmbed.delete();
            return channel.error("Please try again and enter a number between 1 and 5 or exit");
        }

        if (userResponse.first()?.content === "exit") return songEmbed.delete();

        videoIndex = parseInt(userResponse.first()?.content!);
        userResponse.first()?.delete();
        songEmbed.delete();

        if (!videoIndex) videoIndex = 1;

        let video;
        try {
            video = await youtube.getVideoByID(videos[videoIndex - 1].id);
            if (!video) return channel.error("Failed to get video, try again");
        } catch (err) {
            this.handler.logger.error(`Error at getting video by search, query: ${query}`, err);
            return channel.error("We have trouble finding your query please try again");
        }

        // Get video and data required to play;
        const url = `https://www.youtube.com/watch?v=${video.id}`;
        this.handler.commands.get("play")?.run(message, [url], channel);
    }
};
