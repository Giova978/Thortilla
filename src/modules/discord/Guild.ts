import { Client, Guild } from "discord.js";
import GuildModel from "../db/Guild.model";

class GuildDB extends Guild {
    public prefix!: string;
    public mcAdress!: string;
    public modules!: any;
    public tags!: Map<string, string>;
    public tagPrefix!: string;

    constructor(client: Client, data: object) {
        super(client, data);

        this.getDataFromDB();
    }

    private getDataFromDB() {
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
                        })
                        .catch(console.error);
                }

                this.prefix = data.prefix;
                this.mcAdress = data.mcAdress;
                this.modules = data.modules;
                this.tags = data.tags;
                this.tagPrefix = data.tagPrefix;
            })
            .catch(console.error);
    }

    get getPrefix() {
        this.getDataFromDB();
        return this.prefix;
    }

    get getMCAdress() {
        this.getDataFromDB();
        return this.mcAdress;
    }

    get getModulesStatus() {
        this.getDataFromDB();
        return this.modules;
    }

    get getTags() {
        this.getDataFromDB();
        return this.tags;
    }

    get getTagPrefix() {
        this.getDataFromDB();
        return this.tagPrefix;
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
            .then((data: any) => this.tags = data.tags)
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
}

export default GuildDB;
