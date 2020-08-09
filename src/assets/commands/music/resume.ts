import Command from '../../../handlers/Command';
import { Message } from 'discord.js';
import { IArgs } from '../../../Utils';
import Handler from '../../../handlers/Handler';
import TextChannelCS from '../../../modules/discord/TextChannel';

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

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const musicData = this.handler.player.getMusicaData(message.guild!.id);
        if (message.member?.voice.channel !== musicData?.voiceChannel) return channel.error('You have to be in the same voice channel of the song');
        if (!musicData) return channel.error('There is no song playing');
        if (!musicData.player.paused) return channel.error('The song is not paused');

        musicData.player.resume();
        channel.success('The song has been resumed');
    }
}