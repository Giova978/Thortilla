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
            category: "music",
            description: "Adds the last song to the queue",
            usage: "No arguments",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const musicData = this.handler.player.getMusicData(message.guild!.id);
        if (!musicData) return channel.error("No song playing");
        if (musicData.player.queueRepeat || musicData.player.trackRepeat)
            return channel.error("You cant go back to the last song if any type of looping is on");
        if (!musicData.lastTracks[0]) return channel.error("No last song");

        this.handler.player.playLastTrack(message.guild!.id, message.member!);

        channel.success("Last song added to the queue");
    }
};
