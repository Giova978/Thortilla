import Command from "../../../handlers/Command";
import { Message, MessageEmbed } from "discord.js";
import Handler from '../../../handlers/Handler';
import { IArgs } from '../../../Utils';
import TextChannelCS from '../../../modules/discord/TextChannel';
import GuildDB from "@/modules/discord/Guild";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super('tags', {
            aliases: ['listtags'],
            category: 'tags',
            description: 'Show a list of avalible tags',
            usage: 'No arguments'
        });

        this.handler = handler;

    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const guild: GuildDB = message.guild as GuildDB;
        const tags = guild.getTags;
        if (!tags) return channel.info('This server doesnt have tags');

        const tagsString = Array.from(tags.keys()).map(key => `\`${key}\``);
        if (!tagsString) return channel.info('This server doesnt have any tags');

        const embed = new MessageEmbed()
            .setTitle('Tags')
            .setColor('GREEN')
            .setDescription(tagsString.join(' | '))
            .setFooter(`Total tags ${tagsString.length} ● Tags prefix ${guild.getTagPrefix}`);

        channel.send(embed);
    }
}