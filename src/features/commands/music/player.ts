import Command from "@handlers/Command";
import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import Handler from "@handlers/Handler";
import { IArgs, IMusicData } from "@utils";
import TextChannelCS from "@models/discord/TextChannel";
import { stripIndent } from "common-tags";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super("player", {
            permissions: ["PRIORITY_SPEAKER"],
            category: "music",
            description: "Send a embed player to manage music",
            usage: "No arguments",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const musicData = this.handler.player.getMusicData(message.guild!.id);
        if (!musicData || !musicData.nowPlaying) return channel.error("There is no song playing");

        const embed = new MessageEmbed()
            .setTitle("Player")
            .setColor("GREEN")
            .addField(
                "Now playing",
                `[${musicData.nowPlaying.title}](${musicData.nowPlaying.url})\`${musicData.nowPlaying.duration}\``,
            )
            .addField(
                "Next Song",
                musicData.queue[0]
                    ? `[${musicData.queue[0].title}](${musicData.queue[0].url})\`${musicData.queue[0].duration}\``
                    : "Now playing last song",
            )
            .setDescription(this.getDescription(musicData));

        const msg = await message.channel.send(embed);

        const filter = (reaction: MessageReaction, user: User) =>
            user.id === message.author.id &&
            (reaction.emoji.name === "◀" ||
                reaction.emoji.name === "▶" ||
                reaction.emoji.name === "⏸" ||
                reaction.emoji.name === "🔀" ||
                reaction.emoji.name === "🔁" ||
                reaction.emoji.name === "🔂");

        const collecor = msg.createReactionCollector(filter);
    }

    private getDescription(musicData: IMusicData) {
        const { nowPlaying, player, queue, lastTracks } = musicData;

        const text = stripIndent`Looping Queue: ${player.queue.repeatQueue}
       	Looping Song: ${player.queue.repeatTrack}
	Paused: ${player.paused}`;

        return text;
    }
};
