import Command from "../../../handlers/Command";
import { Message } from "discord.js";
import Handler from '../../../handlers/Handler';
import { IArgs } from '../../../Utils';
import GuildDB from "../../../modules/discord/Guild";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super('setmcadress', {
            aliases: ['stmc'],
            permissions: ['ADMINISTRATOR'],
            category: 'config',
            description: 'Set the ip for `getmcplayers` command',
            usage: '<ip>'
        });

        this.handler = handler;

    }

    public async run(message: Message, args: string[]) {
        const guild: GuildDB = message.guild as GuildDB;

        if (!args[0]) {
            const address = guild.getMCAdress;
            if (address) {
                return this.handler.error(`The current ip is \`${address}\``, message.channel);
            }

            return this.handler.error('There is no ip', message.channel);
        }

        guild.setMCAdress(args[0])
            .then((text: string) => message.channel.send(text))
            .catch(err => {
                this.handler.error('Something went wrong, please try again later', message.channel);
                console.error(err);
            });
    }
}