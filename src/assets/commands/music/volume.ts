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
            usage: '<timestamp(formata m:s)>',
        });

        this.disbale();

        this.handler = handler;
    }

    public async run(message: Message, args: string[]) {
        const musicData = this.handler.player.getMusicaData(message.guild!.id);
        if (!musicData) return message.channel.send('There is no song playing');

        const volume = parseInt(args[0]);
        if (isNaN(volume)) return message.channel.send('Give a valid  volume');
        if (volume > 100) return message.channel.send('Give a valid  volume');
        if (volume < 1) return message.channel.send('Give a valid  volume');

        musicData.player.setVolume(volume);
        musicData.volume = volume;

        message.channel.send(`Volume is ${volume}`);
    }
}