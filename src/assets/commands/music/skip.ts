import Command from '../../../handlers/Command';
import { Message, MessageEmbed } from 'discord.js';
import { IArgs } from '../../../Utils';
import Handler from '../../../handlers/Handler';

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

    public run(message: Message, args: string[]) {
        const musicData = this.handler.player.getMusicaData(message.guild!.id);
        if (message.member?.voice.channel !== musicData.voiceChannel) return this.handler.error('You have to be in the same voice channel of the song', message.channel);

        if (!musicData) return this.handler.error('There is no song playing', message.channel);
        if (musicData.queue.length === 0) return this.handler.error('There is no song to skip', message.channel);

        if (args[0] === 'f' && message.member.hasPermission("PRIORITY_SPEAKER")) {
            this.handler.player.skip(message.guild!.id);
            return message.channel.send('Skipped!');
        }

        if (musicData.nowPlaying!.skipVoteUsers.includes(message.member!.id)) return this.handler.error('You cant vote twice', message.channel);

        if (musicData.voiceChannel!.members.size <= 2) {
            this.handler.player.skip(message.guild!.id);
            return message.channel.send('Skipped!');
        }

        musicData.skipVotes++;

        const trueMembers = musicData.player.options.voiceChannel.members.map(member => !member.user.bot);

        const requiredVotes = Math.ceil(trueMembers.length / 2);

        if (musicData.skipVotes >= requiredVotes) {
            this.handler.player.skip(message.guild!.id);
            return message.channel.send('Skipped!');
        }

        musicData.nowPlaying!.skipVoteUsers.push(message.member!.id);

        const embed = new MessageEmbed()
            .setTitle('Skip votes')
            .setColor('GREEN')
            .addField('Skip', `${musicData.skipVotes}/${requiredVotes}`)

        message.channel.send(embed);
    }
}