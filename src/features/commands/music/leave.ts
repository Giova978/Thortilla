import Command from "../../../handlers/Command";
import { Message } from "discord.js";
import { IArgs } from "../../../Utils";
import Handler from "../../../handlers/Handler";
import TextChannelCS from "../../../models/discord/TextChannel";

module.exports = class extends Command {
    public handler: Handler;

    constructor({ handler }: IArgs) {
        super("leave", {
            aliases: ["l"],
            category: "music",
            permissions: ["PRIORITY_SPEAKER"],
            description: "Leave the channel",
            usage: "No arguments",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const musicData = this.handler.player.getMusicData(message.guild!.id);
        if (!musicData) return channel.error("I am not in a voice channel");

        // const chances = [...Array(9).fill(false), true];
        musicData.player.destroy();

        // if (chances[Math.floor(Math.random() * chances.length)]) {
        //     return channel.send("Milobann, eres gay");
        // }

        channel.send("Bye have a great time");
    }
};
