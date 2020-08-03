import Command from '../../../handlers/Command';
import { Message } from 'discord.js';
import { IArgs } from '../../../Utils';
import Handler from '../../../handlers/Handler';

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super('resume', {
            aliases: ['res', 'continue'],
            category: 'music',
            description: 'Resume the current song',
            usage: 'No arguments'
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[]) {
        const musicData = this.handler.player.getMusicaData(message.guild!.id);
        if (message.member?.voice.channel !== musicData?.voiceChannel) return this.handler.error('You have to be in the same voice channel of the song', message.channel);
        if (!musicData) return this.handler.error('There is no song playing', message.channel);
        if (!musicData.player.paused) return this.handler.error('The song is not paused', message.channel);

        musicData.player.resume();
        message.channel.send('The song has been resumed');
    }
}