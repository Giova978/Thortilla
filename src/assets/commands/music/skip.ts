import Command from '../../../handlers/Command';
import { Message, MessageEmbed } from 'discord.js';
import { IArgs } from '../../../Utils';
import Handler from '../../../handlers/Handler';
import TextChannelCS from '../../../modules/discord/TextChannel';

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super('skip', {
            aliases: ['s'],
            category: 'music',
            description: 'Skip the current song',
            usage: '<f for force skip(need PRIORITY_SPEAKER)>'
        });

        this.handler = handler;
    }

    public run(message: Message, args: string[], channel: TextChannelCS) {
        const musicData = this.handler.player.getMusicaData(message.guild!.id);
        if (message.member?.voice.channel !== musicData.voiceChannel) return channel.error('You have to be in the same voice channel of the song');

        if (!musicData) return channel.error('There is no song playing');
        if (musicData.queue.length === 0) return channel.error('There is no song to skip');

        if (args[0] === 'f' && message.member.hasPermission("PRIORITY_SPEAKER")) {
            this.handler.player.skip(message.guild!.id);
            return channel.success('Skipped!');
        }

        if (musicData.nowPlaying!.skipVoteUsers.includes(message.member!.id)) return channel.error('You cant vote twice');

        if (musicData.voiceChannel!.members.size <= 2) {
            this.handler.player.skip(message.guild!.id);
            return channel.success('Skipped!');
        }

        musicData.skipVotes++;

        const trueMembers = musicData.player.options.voiceChannel.members.map(member => !member.user.bot);

        const requiredVotes = Math.ceil(trueMembers.length / 2);

        if (musicData.skipVotes >= requiredVotes) {
            this.handler.player.skip(message.guild!.id);
            return channel.success('Skipped!');
        }

        musicData.nowPlaying!.skipVoteUsers.push(message.member!.id);

        const embed = new MessageEmbed()
            .setTitle('Skip votes')
            .setColor('GREEN')
            .addField('Skip', `${musicData.skipVotes}/${requiredVotes}`)

        channel.send(embed);
    }
}