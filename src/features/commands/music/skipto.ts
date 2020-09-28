import Command from "../../../handlers/Command";
import { Message, MessageEmbed } from "discord.js";
import { IArgs } from "../../../Utils";
import Handler from "../../../handlers/Handler";
import TextChannelCS from "../../../models/discord/TextChannel";

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super("skipto", {
            aliases: ["sto"],
            category: "music",
            description: "Skip to a song specified in the queue",
            usage: "<Song index>",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const musicData = this.handler.player.getMusicaData(message.guild!.id);
        if (message.member?.voice.channel !== musicData?.voiceChannel)
            return channel.error("You have to be in the same voice channel of the song");
        if (!musicData) return channel.error("There is no song playing");
        if (musicData.queue.length === 0) return channel.error("There is no song to skip");

        const queueIndex = parseInt(args[0]);
        // We don't accept 0 because of what we write in the queue file, go and check
        if (!queueIndex || queueIndex < 1 || queueIndex > musicData.queue.length)
            return channel.error("Please enter a valid queue index");

        if (args[1] === "f" && message.member.hasPermission("PRIORITY_SPEAKER")) {
            this.handler.player.skip(message.guild!.id, queueIndex);
            return channel.success(`Skipped to ${queueIndex}!`);
        }

        if (musicData.nowPlaying!.skipVoteUsers.includes(message.member!.id))
            return channel.error("You cant vote twice");

        if (musicData.voiceChannel!.members.size < 2) {
            this.handler.player.skip(message.guild!.id, queueIndex);
            return channel.success(`Skipped to ${queueIndex}!`);
        }

        musicData.skipVotes++;

        const trueMembers = musicData.player.options.voiceChannel.members.filter((member) => !member.user.bot);

        const requiredVotes = Math.ceil(trueMembers.size / 2);

        if (musicData.skipVotes >= requiredVotes) {
            this.handler.player.skip(message.guild!.id, queueIndex);
            return channel.success(`Skipped to ${queueIndex}!`);
        }

        musicData.nowPlaying!.skipVoteUsers.push(message.member!.id);

        const song = musicData.queue[queueIndex];

        const embed = new MessageEmbed()
            .setTitle("Skip votes")
            .setColor("GREEN")
            .addField(`Skip to ${song.title}`, `${musicData.skipVotes}/${requiredVotes}`)
            .setThumbnail(song.thumbnail);

        channel.send(embed);
    }
};
