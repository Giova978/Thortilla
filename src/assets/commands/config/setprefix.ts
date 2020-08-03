import Command from "../../../handlers/Command";
import { Message } from "discord.js";
import Handler from '../../../handlers/Handler';
import { IArgs } from '../../../Utils';
import GuildDB from "../../../modules/discord/Guild";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super('setprefix', {
            aliases: ['stp'],
            permissions: ['MANAGE_GUILD'],
            category: 'config',
            description: 'Set the prefix for the current guild or gets the prefix',
            usage: '[prefix]'
        });

        this.handler = handler;

    }

    public async run(message: Message, args: string[]) {
        const guild: GuildDB = message.guild as GuildDB;

        const prefix = args[0];
        if (!prefix) return this.handler.error(`The current prefix is ${guild.getPrefix}`, message.channel);

        guild.setPrefix(prefix)
            .then((text: string) => message.channel.send(text))
            .catch(err => {
                this.handler.error('Something went wrong, please try again later', message.channel);
                console.error(err);
            })
    }
}