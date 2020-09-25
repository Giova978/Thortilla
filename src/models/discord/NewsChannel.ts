import { Guild, MessageEmbed, NewsChannel } from "discord.js";

class NewsChannelCS extends NewsChannel {
    constructor(guild: Guild, data: any) {
        super(guild, data);
    }

    public error(text: string, timeout: number = 5000) {
        const embed = new MessageEmbed().setColor("RED").addField("Error", `${text}`);

        if (this.lastMessage?.author === this.client.user?.id) {
            this.lastMessage?.edit(embed).then((msg) => msg.delete({ timeout }));
            return;
        }

        this.send(embed).then((msg) => msg.delete({ timeout }));
    }

    public success(text: string, timeout?: number) {
        const embed = new MessageEmbed().setColor("GREEN").setDescription(text);

        if (this.lastMessage?.author === this.client.user?.id) {
            this.lastMessage?.edit(embed).then((msg) => {
                if (!timeout) return;
                msg.delete({ timeout });
            });

            return;
        }

        this.send(embed).then((msg) => {
            if (!timeout) return;
            msg.delete({ timeout });
        });
    }

    public info(text: string, timeout?: number) {
        const embed = new MessageEmbed().setColor("BLUE").setDescription(text);

        if (this.lastMessage?.author === this.client.user?.id) {
            this.lastMessage?.edit(embed).then((msg) => {
                if (!timeout) return;
                msg.delete({ timeout });
            });

            return;
        }

        this.send(embed).then((msg) => {
            if (!timeout) return;
            msg.delete({ timeout });
        });
    }
}

export default NewsChannelCS;
