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
            description: 'Sets the ip for `getmcplayers` command',
            usage: '<ip>'
        });

        this.handler = handler;

    }

    public async run(message: Message, args: string[]) {
        const guild: GuildDB = message.guild as GuildDB;

        if (!args[0]) {
            const address = guild.getMCAdress;
            if (address) {
                return message.channel.send(`The current ip is \`${address}\``);
            }

            return message.channel.send('There is no ip');
        }

        guild.setMCAdress(args[0])
            .then((text: string) => message.channel.send(text))
            .catch(console.error);
    }
}