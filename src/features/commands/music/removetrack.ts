import Command from "../../../handlers/Command";
import { Message } from "discord.js";
import { IArgs } from "../../../Utils";
import Handler from "../../../handlers/Handler";
import TextChannelCS from "../../../models/discord/TextChannel";
import StatModel from "@models/db/Statistic.model";

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super("removetrack", {
            aliases: ["delete", "rt"],
            category: "music",
            permissions: ["PRIORITY_SPEAKER"],
            description: "Delete the song at the given position",
            usage: "<position>",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const musicData = this.handler.player.getMusicData(message.guild!.id);
        if (!musicData) return channel.error("There is no song playing");

        // Add one for it to match with the queue array
        const position = parseInt(args[0]) - 1;
        if (!position || position < 0 || position > musicData.queue.length - 1)
            return channel.error("Give a valid position in queue");

        const removedSong = this.handler.player.removeTrack(message.guild!.id, position);
        if (!removedSong) {
            return channel.error("Couldn't remove the track");
        }

        StatModel.create({
            guildId: message.guild!.id,
            userId: message.author.id,
            songTitle: removedSong.title,
            songUrl: removedSong.url,
            action: "delete",
            addedBy: removedSong.addedBy,
        });

        channel.success(`Removed ${removedSong.title} successfully`);
    }
};
