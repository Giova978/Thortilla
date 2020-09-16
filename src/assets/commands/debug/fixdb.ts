import Command from "../../../handlers/Command";
import { Message } from "discord.js";
import Handler from '../../../handlers/Handler';
import { IArgs } from '../../../Utils';
import TextChannelCS from '../../../modules/discord/TextChannel';
import GuildModel from "@/modules/db/Guild.model";
import MemberModel from "@/modules/db/GuildMember.model";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super('fixdb', {
            category: 'debug',
            description: 'Adds new values to the collections according to schemes',
            usage: 'No arguments'
        });

        this.handler = handler;

    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        // GuildModel.updateMany({}, )
        // MemberModel
    }
}