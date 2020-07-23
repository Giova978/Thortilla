"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const GuildMember_model_1 = __importDefault(require("../db/GuildMember.model"));
class MemberDB extends discord_js_1.GuildMember {
    constructor(client, data, guild) {
        super(client, data, guild);
        this.coins = 0;
        this.getDataFromDB();
    }
    getDataFromDB() {
        GuildMember_model_1.default.findOne({
            userId: this.id,
            guildId: this.guild.id
        })
            .then((data) => {
            if (!data) {
                return GuildMember_model_1.default.create({
                    userId: this.id,
                    guildId: this.guild.id,
                })
                    .then((data) => {
                    this.coins = data.coins;
                })
                    .catch(console.error);
            }
            this.coins = data.coins;
        })
            .catch(console.error);
    }
    getBalance() {
        GuildMember_model_1.default.findOne({
            userId: this.id,
            guildId: this.guild.id
        })
            .then((data) => this.coins = data.coins)
            .catch(console.error);
        return this.coins;
    }
    setBalance(coins) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isNaN(coins))
                return Promise.resolve('Please provide a valid number');
            GuildMember_model_1.default.findOneAndUpdate({ userId: this.id, guildId: this.guild.id }, { coins }, { upsert: true, new: true })
                .then((data) => this.coins = data.coins)
                .catch((err) => Promise.reject(err));
            return Promise.resolve(`Correctly setted balance for <!@${this.id}>`);
        });
    }
    updateBalance(acc) {
        return __awaiter(this, void 0, void 0, function* () {
            const coins = this.getBalance() + acc;
            GuildMember_model_1.default.findOneAndUpdate({ userId: this.id, guildId: this.guild.id }, { coins }, { upsert: true, new: true })
                .then((data) => this.coins = data.coins)
                .catch((err) => Promise.reject(err));
            return Promise.resolve();
        });
    }
}
exports.default = MemberDB;
