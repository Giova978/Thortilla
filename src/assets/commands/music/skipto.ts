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
            description: 'Skip to a song spicified in the queue',
            usage: '<Song index>'
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[]) {
        const musicData = this.handler.player.getMusicaData(message.guild!.id);;
        if (message.member?.voice.channel !== musicData?.voiceChannel) return message.channel.send('You have to be in the same voice channel of the song');
        if (!musicData) return message.channel.send('There is no song to skip');
        if (musicData.queue.length === 0) return message.channel.send('There is no song to skip');

        const queueIndex = parseInt(args[0]);
        if (!queueIndex || queueIndex < 1 || queueIndex > 5) return message.channel.send('Please enter a valid queue index');

        if (args[1] === 'f' && message.member!.id === process.env.OWNER) {
            this.handler.player.skip(message.guild!.id, queueIndex);
            return message.channel.send(`Skipped to ${queueIndex}!`);
        }

        if (musicData.nowPlaying!.skipVoteUsers.includes(message.member!.id)) return message.channel.send('You cant vote twice');
        
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