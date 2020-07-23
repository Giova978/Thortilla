import Command from "../../../handlers/Command";
import Axios from "axios";
import { Message, MessageEmbed } from "discord.js";

module.exports = class extends Command {
    constructor() {
        super('subreddit',{
            aliases: ['sub'],
            category: 'fun',
            description: 'Sends a content from a subreddit',
            usage: '<subreddit>'
        });
    }

    public async run(messsage: Message, args: string[]) {
        messsage.delete();

        const subreddit: string | undefined = args[0]; 
        if (!subreddit) return messsage.channel.send('Give me a valid subreddit please');

        let data: any | undefined;

        try {
            let response = await Axios.get(`https://www.reddit.com/r/${subreddit}/hot.json`);
            data = response.data.data
        } catch (error) {
            console.error(error);
        }

        if (!data) return messsage.channel.send('No data found');

        const collectorFilter = (reaction: any, user: any) => reaction.emoji.name === '⬅️' || reaction.emoji.name === '➡️' || reaction.emoji.name === '🇽'  && user.id === messsage.author.id;
        
        const embed: MessageEmbed = new MessageEmbed().setTitle('Image');

        // The actual image for the embed
        let index: number = 0;

        embed.setImage(data.children[index].data.url);

        const msg: Message = await messsage.channel.send(embed);

        await Promise.all([
            msg.react('⬅️'),
            msg.react('➡️'),
            msg.react('🇽'),
        ])

        const collector = msg.createReactionCollector(collectorFilter, { time: 120000 });

        collector.on('collect', (reaction, reactionCollector) => {
            const newEmbed: MessageEmbed = new MessageEmbed()
            .setTitle('Image');

            if (reaction.emoji.name === '⬅️') {
                index = index-- <= 0 ? 0 : index--;
                newEmbed.setImage(data.children[index].data.url);
                msg.edit(newEmbed)
            }

            if (reaction.emoji.name === '➡️') {
                index = index++ >= data.children.length ? data.children.length : index++;
                newEmbed.setImage(data.children[index].data.url);
                msg.edit(newEmbed);
            }

            if (reaction.emoji.name === '🇽') {
                collector.stop();
            }
        });

        collector.on('end', collected => {
            msg.delete();
            console.log('Ended');
            console.log(collected.size);
        })

    }
}