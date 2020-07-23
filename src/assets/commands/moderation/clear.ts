import Command from "../../../handlers/Command";
import { Message, GuildMember } from "discord.js";
import { Utils } from "../../../Utils";
import { MessageEmbed } from "discord.js";

module.exports = class extends Command {
    
    constructor() {
        super('clear',{
            permissions: ["MANAGE_MESSAGES"],
            category: 'moderation',
            description: 'Clear messages or search x messages for the author given and delete them',
            usage: '<amount> [user]',
        });
    }

    public async run(message: Message, args: string[]) {
        const toDelete = +args[0];
        if (!toDelete) return message.channel.send('Provide a valid number to delete');
        if (toDelete < 1 || toDelete > 100) return message.channel.send('Provide a number between 1 and 100');

        message.delete();

        const user = Utils.getMember(message, args[1]);
        if (user) {
            const messages = await message.channel.messages.fetch({
                limit: toDelete,
            }).then(messages => messages.filter(msg => msg.author.id === user.id))

            if (messages.size < 1) return message.channel.send(`No messages found for \`${user.displayName}\``).then(Utils.deleteMessage);

            return message.channel.bulkDelete(messages, true).then(messagesDeleted => {
                message.channel.send(`Successfully deleted \`${messagesDeleted.size}\` messages from \`${user.displayName}\``).then(Utils.deleteMessage);
            })
            .catch(err => {
                console.error(err);
                message.channel.send('Try again later').then(Utils.deleteMessage);
            });
        }

        message.channel
        .bulkDelete(toDelete, true)
        .then((messagesDeleted, ) => {
            message.channel.send(`Successfully deleted \`${messagesDeleted.size}\` messages`).then(Utils.deleteMessage);
        })
        .catch(err => {
            console.error(err);
            message.channel.send('Try again later').then(Utils.deleteMessage);
        });
    }
}