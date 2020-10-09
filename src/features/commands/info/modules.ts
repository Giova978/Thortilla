import Command from "@handlers/Command";
import { Message, MessageEmbed } from "discord.js";
import Handler from "@handlers/Handler";
import { IArgs } from "@utils";
import TextChannelCS from "@models/discord/TextChannel";
import GuildDB from "@models/discord/Guild";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super("modules", {
            aliases: ["mod", "categories"],
            category: "info",
            description: "Show all modules of Thortilla an their states",
            usage: "",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const guild: GuildDB = message.guild as GuildDB;

        const availableModules = ["music", "balance", "fun", "info", "tags", "moderation"];
        const modules = guild.getModulesStatus;

        const embed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle("Modules")
            .addFields(
                availableModules.map((module) => {
                    const state = modules[module] ? "on" : "off";

                    return {
                        name: module.charAt(0).toUpperCase() + module.slice(1),
                        value: `Current state: ${state}`,
                    };
                }),
            );

        channel.send(embed);
    }
};
