import Command from "../../../handlers/Command";
import { Message, GuildMember } from "discord.js";
import { Utils, IArgs } from "../../../Utils";
import { MessageEmbed } from "discord.js";
import Handler from "../../../handlers/Handler";
import TextChannelCS from "../../../modules/discord/TextChannel";

module.exports = class extends Command {
    public handler: Handler;

    constructor({ handler }: IArgs) {
        super("clear", {
            permissions: ["MANAGE_MESSAGES"],
            permissionsMe: ["MANAGE_MESSAGES"],
            category: "moderation",
            description: "Clear x messages or search x messages for the author given and delete them",
            usage: "<amount> [user]",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const toDelete = +args[0];
        if (!toDelete || isNaN(toDelete)) return channel.error("Provide a valid number to delete");
        if (toDelete < 1 || toDelete > 100) return channel.error("Provide a number between 1 and 100");

        message.delete();

        const user = Utils.getMember(message, args[1]);
        if (user) {
            const messages = await message.channel.messages
                .fetch({
                    limit: toDelete,
                })
                .then((messages) => messages.filter((msg) => msg.author.id === user.id));

            if (messages.size < 1) return channel.error(`No messages found for <@${user.id}>`);

            return message.channel
                .bulkDelete(messages, true)
                .then((messagesDeleted) => {
                    channel.success(`Successfully deleted \`${messagesDeleted.size}\` messages from <@${user.id}>`, 2000);
                })
                .catch((err) => {
                    console.error(err);
                    channel.error("Try again later");
                });
        }

        message.channel
            .bulkDelete(toDelete, true)
            .then((messagesDeleted) => {
                channel.success(`Successfully deleted \`${messagesDeleted.size}\` messages`, 2000);
            })
            .catch((err) => {
                console.error(err);
                channel.error("Try again later");
            });
    }
};
