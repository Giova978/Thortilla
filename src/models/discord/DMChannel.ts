import { MessageEmbed, DMChannel, Client } from "discord.js";

class DMChannelCS extends DMChannel {
    public prefix!: string;
    public mcAdress!: string;
    public modules!: any;

    constructor(client: Client, data: any) {
        super(client, data);
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

export default DMChannelCS;
