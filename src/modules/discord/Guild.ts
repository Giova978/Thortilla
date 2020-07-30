import { Client, Guild } from "discord.js";
import GuildModel from "../db/Guild.model";

class GuildDB extends Guild {
    public prefix!: string;
    public mcAdress!: string;
    public modules!: any;

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
                        })
                        .catch(console.error);
                }

                this.prefix = data.prefix;
                this.mcAdress = data.mcAdress;
                this.modules = data.modules;
            })
            .catch(console.error);
    }

    public getPrefix() {
        // GuildModel.findOne({
        //     guildId: this.id,
        // })
        //     .then((data: any) => (this.prefix = data.prefix ?? "$"))
        //     .catch(console.error);

        return this.prefix;
    }

    public getMCAdress() {
        // GuildModel.findOne({
        //     guildId: this.id,
        // })
        //     .then((data: any) => (this.mcAdress = data.mcAdress))
        //     .catch(console.error);

        return this.mcAdress;
    }

    public getModulesStatus() {
        // GuildModel.findOne({
        //     guildId: this.id,
        // })
        //     .then((data: any) => (this.modules = data.modules))
        //     .catch(console.error);

        return this.modules;
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
}

export default GuildDB;
