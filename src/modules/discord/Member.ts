import { Guild, GuildMember, Client } from "discord.js";
import MemberModel from "../db/GuildMember.model";

class MemberDB extends GuildMember {
    public coins: number = 0;

    constructor(client: Client, data: object, guild: Guild) {
        super(client, data, guild);

        this.getDataFromDB();
    }

    private getDataFromDB() {
        MemberModel.findOne({
            userId: this.id,
            guildId: this.guild.id
        })
        .then((data: any) => {
            if (!data) {
                return MemberModel.create({
                   userId: this.id,
                    guildId: this.guild.id,
                })
                .then((data: any) => {
                    this.coins = data.coins;
                })
                .catch(console.error);
            }

            this.coins = data.coins;
        })
        .catch(console.error);
    }

    public getBalance() {
        MemberModel.findOne({
           userId: this.id, 
            guildId: this.guild.id
        })
        .then((data: any) => this.coins = data.coins)
        .catch(console.error);

        return this.coins;
    }

    public async setBalance(coins: number) {
        if (isNaN(coins)) return Promise.resolve('Please provide a valid number');
        MemberModel.findOneAndUpdate(
            {userId: this.id, guildId: this.guild.id },
            { coins },
            { upsert: true, new: true }
        )
        .then((data: any) => this.coins = data.coins)
        .catch((err: Error) => Promise.reject(err));

        return Promise.resolve(`Correctly setted balance for <!@${this.id}>`);
    }

    public async updateBalance(acc: number) {
        const coins = this.getBalance() + acc;

        MemberModel.findOneAndUpdate(
            {userId: this.id, guildId: this.guild.id },
            { coins },
            { upsert: true, new: true }
        )
        .then((data: any) => this.coins = data.coins)
        .catch((err: Error) => Promise.reject(err));

        return Promise.resolve();
    }
}

export default MemberDB;