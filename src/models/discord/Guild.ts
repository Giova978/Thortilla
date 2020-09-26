import { BanLog, ClearLog, KickLog } from "@utils";
import { Client, Guild, MessageEmbed, TextChannel } from "discord.js";
import GuildModel from "@models/db/Guild.model";

class GuildDB extends Guild {
    public prefix!: string;
    public mcAdress!: string;
    public modules!: any;
    public tags!: Map<string, string>;
    public tagPrefix!: string;
    public logChannel!: string;

    constructor(client: Client, data: object) {
        super(client, data);

        this.getDataFromDB();
    }

    public getDataFromDB() {
        GuildModel.findOne({
            guildId: this.id,
        })
            .then((data: any) => {
                if (!data) {
                    return GuildModel.create({
                        guildId: this.id,
                    })
                        .then((data: any) => {
                            this.prefix = data.prefix;
                            this.mcAdress = data.mcAdress;
                            this.modules = data.modules;
                            this.tags = data.tags;
                            this.tagPrefix = data.tagPrefix;
                            this.logChannel = data.logChannel;
                        })
                        .catch(console.error);
                }

                this.prefix = data.prefix;
                this.mcAdress = data.mcAdress;
                this.modules = data.modules;
                this.tags = data.tags;
                this.tagPrefix = data.tagPrefix;
                this.logChannel = data.logChannel;
            })
            .catch(console.error);
    }

    get getPrefix() {
        return this.prefix;
    }

    get getMCAdress() {
        return this.mcAdress;
    }

    get getModulesStatus() {
        return this.modules;
    }

    get getTags() {
        return this.tags;
    }

    get getTagPrefix() {
        return this.tagPrefix;
    }

    get getLogChannel() {
        return this.logChannel;
    }

    public async setPrefix(prefix: string) {
        if (prefix.length > 5) return Promise.resolve("Can't set a prefix longer than 4 characters");
        await GuildModel.findOneAndUpdate({ guildId: this.id }, { prefix: prefix }, { new: true, upsert: true })
            .then((data: any) => (this.prefix = data.prefix))
            .catch((err: Error) => Promise.reject(err));

        return Promise.resolve(`The new prefix is \`${this.prefix}\``);
    }

    public async setMCAdress(adress: string) {
        if (!adress) return Promise.resolve("Can't set a empty ip");
        await GuildModel.findOneAndUpdate({ guildId: this.id }, { mcAdress: adress }, { new: true, upsert: true })
            .then((data: any) => (this.mcAdress = data.mcAdress))
            .catch((err: Error) => Promise.reject(err));

        return Promise.resolve(`The new ip is \`${this.mcAdress}\``);
    }

    public async setModulesStatus(modules: any) {
        await GuildModel.findOneAndUpdate({ guildId: this.id }, { modules }, { new: true, upsert: true })
            .then((data: any) => (this.modules = data.modules))
            .catch((err: Error) => Promise.reject(err));

        return Promise.resolve(true);
    }

    public async setTags(tags: Map<string, string>) {
        await GuildModel.findOneAndUpdate({ guildId: this.id }, { tags }, { new: true, upsert: true })
            .then((data: any) => (this.tags = data.tags))
            .catch((err: Error) => Promise.reject(err));

        return Promise.resolve(true);
    }

    public async setTagPrefix(prefix: string) {
        if (prefix.length > 2) return Promise.resolve("Can't set a tag prefix longer than 2 characters");
        await GuildModel.findOneAndUpdate({ guildId: this.id }, { tagPrefix: prefix }, { new: true, upsert: true })
            .then((data: any) => (this.tagPrefix = data.tagPrefix))
            .catch((err: Error) => Promise.reject(err));

        return Promise.resolve(`The new prefix is \`${this.tagPrefix}\``);
    }

    public async setLogChannel(channelId: string) {
        if (typeof channelId !== "string") return Promise.reject(false);
        await GuildModel.findOneAndUpdate({ guildId: this.id }, { logChannel: channelId }, { new: true, upsert: true })
            .then((data: any) => (this.logChannel = data.logChannel))
            .catch((err: Error) => Promise.reject(err));

        return Promise.resolve(true);
    }

    public sendLog<T extends "clear" | "ban" | "kick">(type: T, payload: Params[T]) {
        const channel = this.channels.resolve(this.getLogChannel) as TextChannel;
        if (!channel) return;

        let time, embed;
        const { date, reason } = payload as KickLog | BanLog;

        switch (type) {
            case "kick":
                const { kickedBy, kickedMember } = payload as KickLog;
                time = `${date.getUTCMonth()}-${date.getUTCDay()}-${date.getUTCFullYear()} | ${date.getUTCHours()}:${date.getUTCMinutes()} UTC`;

                embed = new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle("Kick Log")
                    .setThumbnail(kickedBy.user.avatarURL({ dynamic: false }) || "")
                    .addField(
                        "Kicked:",
                        `${kickedMember.user.username}#${kickedMember.user.discriminator}(${kickedMember.id})`,
                    )
                    .addField("Kicked By:", `<@${kickedBy.id}>`, true)
                    .addField("Reason:", reason, false)
                    .addField("Date:", time, true)
                    .setTimestamp(date);

                channel.send(embed);
                break;

            case "ban":
                let { bannedMember, bannedBy } = payload as BanLog;
                time = `${date.getUTCMonth()}-${date.getUTCDay()}-${date.getUTCFullYear()} | ${date.getUTCHours()}:${date.getUTCMinutes()} UTC`;

                embed = new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle("Ban Log")
                    .setThumbnail(bannedBy.user.avatarURL({ dynamic: false }) || "")
                    .addField(
                        "Banned:",
                        `${bannedMember.user.username}#${bannedMember.user.discriminator}(${bannedMember.id})`,
                    )
                    .addField("Banned By:", `<@${bannedBy.id}>`, true)
                    .addField("Reason:", reason, false)
                    .addField("Date:", time, true)
                    .setTimestamp(date);

                channel.send(embed);
                break;

            case "clear":
                const { clearedChannel, numberOfMessages, clearedBy, messagesAuthor } = payload as ClearLog;

                embed = new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle("Clear Log")
                    .addField("Channel:", `<#${clearedChannel.id}>`)
                    .addField("Messages Cleared:", numberOfMessages, true)
                    .addField("Cleaned By:", `<@${clearedBy.id}>`);

                if (messagesAuthor)
                    embed.addField(
                        "Messages Author:",
                        `${messagesAuthor.user.username}#${messagesAuthor.user.discriminator}(${messagesAuthor.id})`,
                    );

                channel.send(embed);
                break;

            default:
                break;
        }
    }
}

type Params = {
    ban: BanLog;
    kick: KickLog;
    clear: ClearLog;
};

export default GuildDB;
