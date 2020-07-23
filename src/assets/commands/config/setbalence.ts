import Command from "../../../handlers/Command";
import { Message } from "discord.js";
import Handler from '../../../handlers/Handler';
import { IArgs, Utils } from '../../../Utils';
import MemberDB from "../../../modules/discord/Member";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super('setbalance',{
            aliases: ['stb'],
            permissions: ['ADMINISTRATOR'],
            category: 'config',
            description: 'Sets the balance of a user',
            usage: '<user> <quantity>'
        });

        this.handler = handler;

    }

    public async run(message: Message, args: string[]) {
        const member = (Utils.getMember(message, args[0]) || message.member) as MemberDB;
        if (!member) return message.channel.send('Please give a user');

        const newBalance = +args[0];
        if (isNaN(newBalance)) return message.channel.send('Please give a valid number');

        member.setBalance(newBalance)
        .then(() => {
            message.channel.send('Balance changed successfully');
        })
        .catch(err => {
            message.channel.send('Something went wrong, please try again later');
            console.error(err);
        })
    }
}