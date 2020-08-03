import Command from '../../../handlers/Command';
import { Message } from 'discord.js';
import { IArgs } from '../../../Utils';
import Handler from '../../../handlers/Handler';

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super('volume', {
            aliases: ['v'],
            category: 'music',
            description: 'Skips to the gived timestamp',
            usage: '<volume>',
        });

        this.disbale();

        this.handler = handler;
    }

    public async run(message: Message, args: string[]) {
        const musicData = this.handler.player.getMusicaData(message.guild!.id);
        if (!musicData) return this.handler.error('There is no song playing', message.channel);

        const volume = parseInt(args[0]);
        if (isNaN(volume)) return this.handler.error('Give a valid  volume', message.channel);
        if (volume > 100) return this.handler.error('Give a valid  volume', message.channel);
        if (volume < 1) return this.handler.error('Give a valid  volume', message.channel);

        musicData.player.setVolume(volume);
        musicData.volume = volume;

        message.channel.send(`Volume is ${volume}`);
    }
}