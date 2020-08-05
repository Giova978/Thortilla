import Command from "../../../handlers/Command";
import { Message } from "discord.js";
import Handler from '../../../handlers/Handler';
import { IArgs, Utils } from '../../../Utils';
import MemberDB from "../../../modules/discord/Member";

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

    public async run(message: Message, args: string[]) {
        const member = (Utils.getMember(message, args[0]) || message.member) as MemberDB;
        if (!member) return this.handler.error('Please give a user', message.channel);

        const newBalance = +args[1];
        if (isNaN(newBalance)) return this.handler.error('Please give a valid number', message.channel);
        member.setBalance(newBalance)
            .then(() => {
                message.channel.send('Balance changed successfully');
            })
            .catch(err => {
                this.handler.error('Something went wrong, please try again later', message.channel);
                console.error(err);
            })
    }
}