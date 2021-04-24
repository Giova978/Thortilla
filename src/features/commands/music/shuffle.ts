import Command from "@handlers/Command";
import { Message } from "discord.js";
import Handler from "@handlers/Handler";
import { IArgs, Song, Utils } from "../../../Utils";
import TextChannelCS from "@models/discord/TextChannel";
import { Player } from 'erela.js';

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super("shuffle", {
            aliases: ["random"],
            permissions: ["PRIORITY_SPEAKER"],
            category: "music",
            description: "Shuffle the queue",
            usage: "No arguments",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const musicData = this.handler.player.getMusicData(message.guild!.id);
        if (!musicData) return channel.error("There is no music playing");
        if (!musicData.queue) return channel.error("No queue to shuffle");
        if (musicData.queue.length < 2) return channel.error("Cant shuffle 1 song");
        if (musicData.player.queueRepeat) return channel.error("You cant shuffle while the queue is looping");

        this.handler.player.shuffle(message.guild!.id);
        channel.success("Shuffled the queue");
    }
};
