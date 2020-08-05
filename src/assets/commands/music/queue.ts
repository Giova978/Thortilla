import Command from '../../../handlers/Command';
import { Message, MessageEmbed } from 'discord.js';
import { IArgs } from '../../../Utils';
import Handler from '../../../handlers/Handler';

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super('queue', {
            aliases: ['q'],
            category: 'music',
            description: 'Show the current queue',
            usage: 'No arguments'
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[]) {
        const musicData = this.handler.player.getMusicaData(message.guild!.id);;
        if (!musicData.queue || musicData.queue.length === 0) return this.handler.error('There is no queue', message.channel);

        const embed = new MessageEmbed()
            .setColor('GREEN')
            .setTitle('Queue')
            .setTimestamp()
            .setAuthor(this.handler.client.user?.username, this.handler.client.user?.displayAvatarURL());

        let description = '';

        musicData.queue.forEach((song, index) => {
            description += `\n\`${index}\`[${song.title}](${song.url}) ${song.duration}`;
        });

        embed.setDescription(description);

        message.channel.send(embed);
    }
}