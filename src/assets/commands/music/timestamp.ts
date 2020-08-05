import Command from '../../../handlers/Command';
import { Message } from 'discord.js';
import { IArgs } from '../../../Utils';
import Handler from '../../../handlers/Handler';

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super('timestamp', {
            aliases: ['seek', 'ts'],
            category: 'music',
            permissions: ["PRIORITY_SPEAKER"],
            description: 'Skip to the gived timestamp',
            usage: '<timestamp(formata m:s)>'
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[]) {
        const musicData = this.handler.player.getMusicaData(message.guild!.id);
        if (!musicData) return this.handler.error('There is no song playing', message.channel);

        const time = args[0];
        if (!time) return this.handler.error('Give a timestamp', message.channel);

        const [minutes, seconds] = time.split(':');

        if (!minutes) return this.handler.error('Give a good formated timestamp', message.channel);
        if (!time) return this.handler.error('Give a good formated timestamp', message.channel);

        const timeToSkip = ((parseInt(minutes) * 60) + parseInt(seconds)) * 1000;

        musicData.player.seek(timeToSkip);

        message.channel.send(`Skipped to ${time}`);
    }
}