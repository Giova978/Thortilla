import Command from "../../../handlers/Command";
import { Message, GuildMember } from "discord.js";
import { Utils, IArgs } from "../../../Utils";
import { MessageEmbed } from "discord.js";
import Handler from "../../../handlers/Handler";

module.exports = class extends Command {
    public handler: Handler;

    constructor({ handler }: IArgs) {
        super("clear", {
            permissions: ["MANAGE_MESSAGES"],
            category: "moderation",
            description: "Clear x messages or search x messages for the author given and delete them",
            usage: "<amount> [user]",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[]) {
        const toDelete = +args[0];
        if (!toDelete) return this.handler.error("Provide a valid number to delete", message.channel);
        if (toDelete < 1 || toDelete > 100) return this.handler.error("Provide a number between 1 and 100", message.channel);

        message.delete();

        const user = Utils.getMember(message, args[1]);
        if (user) {
            const messages = await message.channel.messages
                .fetch({
                    limit: toDelete,
                })
                .then((messages) => messages.filter((msg) => msg.author.id === user.id));

            if (messages.size < 1) return this.handler.error(`No messages found for <@${user.id}>`, message.channel);

            return message.channel
                .bulkDelete(messages, true)
                .then((messagesDeleted) => {
                    message.channel.send(`Successfully deleted \`${messagesDeleted.size}\` messages from <@${user.id}>`).then(Utils.deleteMessage);
                })
                .catch((err) => {
                    console.error(err);
                    this.handler.error("Try again later", message.channel);
                });
        }

        message.channel
            .bulkDelete(toDelete, true)
            .then((messagesDeleted) => {
                message.channel.send(`Successfully deleted \`${messagesDeleted.size}\` messages`).then(Utils.deleteMessage);
            })
            .catch((err) => {
                console.error(err);
                this.handler.error("Try again later", message.channel);
            });
    }
};
