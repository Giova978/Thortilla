import Command from "../../../handlers/Command";
import { Message, MessageEmbed } from "discord.js";
import { IArgs } from "../../../Utils";
import Handler from "../../../handlers/Handler";
import { LavaNode } from "@anonymousg/lavajs";

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

    public async run(message: Message, args: string[]) {
        const musicData = this.handler.player.getMusicaData(message.guild!.id);
        if (!musicData) return message.channel.send("I am not in a voicechannel");

        musicData.player.destroy();

        // @ts-ignore
        new LavaNode(this.handler.lavaClient, this.handler.nodes[0]).wsSend({
            op: "leave",
            guil_id: message.guild!.id,
        });

        this.handler.player.guildsMusicData.delete(message.guild!.id);

        return message.channel.send("Bye have a great time");
    }
};
