import { Guild, TextChannel, MessageEmbed } from "discord.js";

class TextChannelCS extends TextChannel {
    public prefix!: string;
    public mcAdress!: string;
    public modules!: any;

    constructor(guild: Guild, data: any) {
        super(guild, data);
    }

    public error(text: string, timeout: number = 5000) {
        const embed = new MessageEmbed()
            .setColor('RED')
            .addField('Error', `\`${text}\``);

        this.send(embed).then((msg) => msg.delete({ timeout }));
    }

    public success(text: string, timeout?: number) {
        const embed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(text);

        this.send(embed)
            .then(msg => {
                if (!timeout) return;
                msg.delete({ timeout })
            });
    }

    public info(text: string, timeout?: number) {
        const embed = new MessageEmbed()
            .setColor("BLUE")
            .setDescription(text);

        this.send(embed)
            .then(msg => {
                if (!timeout) return;
                msg.delete({ timeout })
            });
    }
}

export default TextChannelCS;
