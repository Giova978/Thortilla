import Command from "../../../handlers/Command";
import { Message, MessageEmbed } from "discord.js";
import Handler from '../../../handlers/Handler';
import { IArgs } from '../../../Utils';
import Axios from "axios";
import GuildDB from "../../../modules/discord/Guild";
import TextChannelCS from "../../../modules/discord/TextChannel";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super('getmcplayers', {
            aliases: ['gmcp', 'gmc'],
            category: 'info',
            description: 'Gets the player count for the current minecraft server ip',
            usage: 'No arguments'
        });

        this.handler = handler;

    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const guild: GuildDB = message.guild as GuildDB;

        const ip = guild.getMCAdress;

        if (!ip) return channel.error('There is no ip');

        const { motd, players }: any = await (await Axios.get(`https://mcapi.us/server/status?ip=${ip}`)).data;

        const embed = new MessageEmbed()
            .setTitle(`Players in ${ip}`)
            .setColor("GREEN")
            .addField('Players online', `${players.now}/${players.max}`, true)

        message.channel.send(embed);
    }
}