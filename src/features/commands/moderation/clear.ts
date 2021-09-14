import Command from "../../../handlers/Command";
import { Message, NewsChannel, TextChannel } from "discord.js";
import { Utils, IArgs } from "../../../Utils";
import Handler from "../../../handlers/Handler";
import TextChannelCS from "../../../models/discord/TextChannel";
import GuildDB from "@models/discord/Guild";

module.exports = class extends Command {
    public handler: Handler;

    constructor({ handler }: IArgs) {
        super("clear", {
            permissions: ["MANAGE_MESSAGES"],
            permissionsMe: ["MANAGE_MESSAGES"],
            aliases: ["purge", "delete"],
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

        await message.delete();

        const user = Utils.getMember(message, args[1]);
        if (user) {
            const messages = await message.channel.messages
                .fetch({
                    limit: toDelete,
                })
                .then((messages) => messages.filter((msg) => msg.author.id === user.id));

            if (messages.size < 1) return channel.error(`No messages found for <@${user.id}>`);

            return channel
                .bulkDelete(messages, true)
                .then((messagesDeleted) => {
                    channel.success(
                        `Successfully deleted \`${messagesDeleted.size}\` messages from <@${user.id}>`,
                        1000,
                    );

                    (message.guild as GuildDB).sendLog("clear", {
                        clearedBy: message.member!,
                        messagesAuthor: user,
                        clearedChannel: channel,
                        numberOfMessages: toDelete,
                    });
                })
                .catch((err) => {
                    this.handler.logger.error(err);
                    channel.error("Try again later");
                });
        }

        channel
            .bulkDelete(toDelete, true)
            .then((messagesDeleted) => {
                channel.success(`Successfully deleted \`${messagesDeleted.size}\` messages`, 1000);

                (message.guild as GuildDB).sendLog("clear", {
                    clearedBy: message.member!,
                    clearedChannel: channel,
                    numberOfMessages: messagesDeleted.size,
                });
            })
            .catch((err) => {
                this.handler.logger.error(err);
                channel.error("Try again later");
            });
    }
};
