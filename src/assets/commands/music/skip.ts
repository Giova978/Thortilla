import Command from '../../../handlers/Command';
import { Message, MessageEmbed } from 'discord.js';
import { IArgs } from '../../../Utils';
import Handler from '../../../handlers/Handler';

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super('skip',{
            aliases: ['s'],
            category: 'music',
            description: 'Skip the current song',
            usage: 'No arguments'
        });

        this.handler = handler;
    }

    public run(message: Message, args: string[]) {
        const musicData = this.handler.player.getMusicaData(message.guild!.id);
        if (message.member?.voice.channel !== musicData.voiceChannel) return message.channel.send('You have to be in the same voice channel of the song');

        if (!musicData) return message.channel.send('There is no song playing');
        if (musicData.queue.length === 0) return message.channel.send('There is no song to skip');

        if (args[0] === 'f' && message.member!.id === process.env.OWNER) {
            this.handler.player.skip(message.guild!.id);
            return message.channel.send('Skipped!');
        }

        if (musicData.nowPlaying!.skipVoteUsers.includes(message.member!.id)) return message.channel.send('You cant vote twice');
        
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

    // public skip(musicData: MusicData) {
    //     if (musicData.queue.length < 1) {
    //         musicData.musicDispatcher.destroy();

    //         musicData.isPlaying = false;
    //         musicData.nowPlaying = null;
    //         musicData.voiceChannel = null;

    //         new LavaNode(this.handler.lavaClient, this.handler.nodes[0]).wsSend({
    //             op: "leave",
    //             guil_id: musicData.musicDispatcher.options.guild.id
    //         })
    //     } else {
    //         musicData.musicDispatcher.play();
    //     }
    // }
}