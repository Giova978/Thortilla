import Command from '../../../handlers/Command';
import { Message } from 'discord.js';
import { IArgs } from '../../../Utils';
import Handler from '../../../handlers/Handler';

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super('timestamp',{
            aliases: ['seek', 'ts'],
            category: 'music',
            description: 'Skips to the gived timestamp',
            usage: '<timestamp(formata m:s)>'
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[]) {
        const musicData = this.handler.player.getMusicaData(message.guild!.id);
        if (!musicData) return message.channel.send('There is no song playing');

        const time = args[0];
        if (!time) return message.channel.send('Give a timestamp');

        const [minutes, seconds] = time.split(':');

        if (!minutes) return message.channel.send('Give a good formated timestamp');
        if (!time) return message.channel.send('Give a good formated timestamp');

        const timeToSkip = ((parseInt(minutes) * 60) + parseInt(seconds)) * 1000;

        musicData.player.seek(timeToSkip);

        message.channel.send(`Skipped to ${time}`);
    }
}