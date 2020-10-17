import Command from "@handlers/Command";
import { Message } from "discord.js";
import Handler from "@handlers/Handler";
import { IArgs } from "@utils";
import TextChannelCS from "@models/discord/TextChannel";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super("lasttrack", {
            aliases: ["lt"],
            permissions: ["PRIORITY_SPEAKER"],
            category: "music",
            description: "Play the last track",
            usage: "No arguments",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const musicData = this.handler.player.getMusicData(message.guild!.id);
        if (!musicData) return channel.error("No song playing");
        if (!musicData.lastTracks[0]) return channel.error("No last song, this is the first song");

        this.handler.player.playLastTrack(message.guild!.id, message.member!);

        channel.success("Now playing the last song");
    }
};
