import Command from "../../../handlers/Command";
import { Message, MessageEmbed } from "discord.js";
import { IArgs } from "../../../Utils";
import Handler from "../../../handlers/Handler";
import TextChannelCS from "../../../models/discord/TextChannel";

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super("queue", {
            aliases: ["q"],
            category: "music",
            description: "Show the current queue",
            usage: "No arguments",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const musicData = this.handler.player.getMusicData(message.guild!.id);
        if (!musicData?.queue || musicData.queue.length === 0) return channel.error("There is no queue");

        const embed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle("Queue")
            .setTimestamp()
            .setFooter(
                `Looping queue: ${musicData.player.queueRepeat} | Looping track: ${musicData.player.trackRepeat}`,
            )
            .setAuthor(this.handler.client.user?.username, this.handler.client.user?.displayAvatarURL());

        let description = "";

        // Add one to the index not only for human-readable
        // Actually in the queue of the Player the index 0 is the current song so the 1 is the index 0 in the queue of the musicData
        // We just add one to not have to add it later and its more human-readable
        // And we ensure that the user will enter a correct index
        musicData.queue.forEach((song, index) => {
            // If loopQueue is true this line will remove the current playing song from showing in queue
            // Otherwise it will do nothing
            if (song.url === musicData.nowPlaying?.url && musicData.player.queueRepeat) return;
            description += `\n\`${index + 1}\`[${song.title}](${song.url}) ${song.duration} [<@${song.addedBy}>]`;
        });

        embed.setDescription(description);

        channel.send(embed);
    }
};
