import Command from "../../../handlers/Command";
import { Message } from "discord.js";
import Handler from "../../../handlers/Handler";
import { IArgs } from "../../../Utils";
import GuildDB from "../../../models/discord/Guild";
import TextChannelCS from "../../../models/discord/TextChannel";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super("setmcadress", {
            aliases: ["stmc"],
            permissions: ["ADMINISTRATOR"],
            category: "config",
            description: "Set the ip for `getmcplayers` command",
            usage: "<ip>",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const guild: GuildDB = message.guild as GuildDB;

        if (!args[0]) {
            const address = guild.getMCAdress;
            if (address) {
                return channel.error(`The current ip is \`${address}\``);
            }

            return channel.error("There is no ip");
        }

        guild
            .setMCAdress(args[0])
            .then((text: string) => message.channel.send(text))
            .catch((err) => {
                channel.error("Something went wrong, please try again later");
                this.handler.logger.error(`Error at updating mcAdress at guild ${guild.id}`, err);
            });
    }
};
