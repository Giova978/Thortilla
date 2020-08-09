import Command from "../../../handlers/Command";
import { Message } from "discord.js";
import Handler from '../../../handlers/Handler';
import { IArgs, Utils } from '../../../Utils';
import MemberDB from "../../../modules/discord/Member";
import TextChannelCS from "../../../modules/discord/TextChannel";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super('setbalance', {
            aliases: ['stb'],
            permissions: ['ADMINISTRATOR'],
            category: 'config',
            description: 'Set the balance of a user',
            usage: '<user> <quantity>'
        });

        this.handler = handler;

    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const member = (Utils.getMember(message, args[0]) || message.member) as MemberDB;
        if (!member) return channel.error('Please give a user');

        const newBalance = +args[1];
        if (isNaN(newBalance)) return channel.error('Please give a valid number');
        member.setBalance(newBalance)
            .then(() => {
                channel.success('Balance changed successfully');
            })
            .catch(err => {
                channel.error('Something went wrong, please try again later');
                console.error(err);
            })
    }
}