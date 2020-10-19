import Command from "@handlers/Command";
import { Message } from "discord.js";
import Handler from "@handlers/Handler";
import { IArgs } from "@utils";
import TextChannelCS from "@models/discord/TextChannel";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super("loopqueue", {
            category: "music",
            description: "Toggle loop the queue. It will disable loop track",
            usage: "No arguments",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const musicData = this.handler.player.getMusicData(message.guild!.id);
        if (!musicData) return channel.error("No song playing");

        channel.success(`Looping queue: ${this.handler.player.loopQueue(message.guild!.id)}`);
    }
};
