import Command from '../../../handlers/Command';
import { Message } from 'discord.js';
import { IArgs } from '../../../Utils';
import Handler from '../../../handlers/Handler';
import TextChannelCS from '../../../modules/discord/TextChannel';

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super('volume', {
            aliases: ['v'],
            category: 'music',
            description: 'Set the volume of the player',
            usage: '<volume>',
        });

        this.disbale();

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const musicData = this.handler.player.getMusicaData(message.guild!.id);
        if (!musicData) return channel.error('There is no song playing');

        const volume = parseInt(args[0]);
        if (isNaN(volume)) return channel.error('Give a valid  volume');
        if (volume > 100) return channel.error('Give a valid  volume');
        if (volume < 1) return channel.error('Give a valid  volume');

        musicData.player.setVolume(volume);
        musicData.volume = volume;

        channel.success(`Volume is ${volume}`);
    }
}