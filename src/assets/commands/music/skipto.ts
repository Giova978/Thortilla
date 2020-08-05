import Command from '../../../handlers/Command';
import { Message, MessageEmbed } from 'discord.js';
import { IArgs } from '../../../Utils';
import Handler from '../../../handlers/Handler';

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super('skipto', {
            aliases: ['sto'],
            category: 'music',
            description: 'Skip to a song specified in the queue',
            usage: '<Song index>'
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[]) {
        const musicData = this.handler.player.getMusicaData(message.guild!.id);;
        if (message.member?.voice.channel !== musicData?.voiceChannel) return this.handler.error('You have to be in the same voice channel of the song', message.channel);
        if (!musicData) return this.handler.error('There is no song playing', message.channel);
        if (musicData.queue.length === 0) return this.handler.error('There is no song to skip', message.channel);

        const queueIndex = parseInt(args[0]);
        // We don't accept 0 because of what we write in the queue file, go and check
        if (!queueIndex || queueIndex < 1 || queueIndex > 5) return this.handler.error('Please enter a valid queue index', message.channel);

        if (args[1] === 'f' && message.member.hasPermission("PRIORITY_SPEAKER")) {
            this.handler.player.skip(message.guild!.id, queueIndex);
            return message.channel.send(`Skipped to ${queueIndex}!`);
        }

        if (musicData.nowPlaying!.skipVoteUsers.includes(message.member!.id)) return this.handler.error('You cant vote twice', message.channel);

        if (musicData.voiceChannel!.members.size < 2) {
            this.handler.player.skip(message.guild!.id, queueIndex);
            return message.channel.send(`Skipped to ${queueIndex}!`);
        }

        musicData.skipVotes++;

        const trueMembers = musicData.player.options.voiceChannel.members.map(member => !member.user.bot);

        const requiredVotes = Math.ceil(trueMembers.length / 2);

        if (musicData.skipVotes >= requiredVotes) {
            this.handler.player.skip(message.guild!.id, queueIndex);
            return message.channel.send(`Skipped to ${queueIndex}!`);
        }

        musicData.nowPlaying!.skipVoteUsers.push(message.member!.id);

        const song = musicData.queue[queueIndex];

        const embed = new MessageEmbed()
            .setTitle('Skip votes')
            .setColor('GREEN')
            .addField(`Skip to ${song.title}`, `${musicData.skipVotes}/${requiredVotes}`)
            .setThumbnail(song.thumbnail);

        message.channel.send(embed);
    }
}