import { MessageEmbed } from 'discord.js';
import { Fields, IEmbedField } from '../Utils';

export default class Embed {
    public embed: MessageEmbed;

    constructor() {
        this.embed = new MessageEmbed();
    }

    public addFields(fields: Fields): void {
        for (const field of fields) {
            let { name, value, inline = false } = field;

            this.embed.addField(name, value, inline);
        }
    }
}