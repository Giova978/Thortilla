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
const Guild_model_1 = __importDefault(require("../db/Guild.model"));
class GuildDB extends discord_js_1.Guild {
    constructor(client, data) {
        super(client, data);
        this.getDataFromDB();
    }
    getDataFromDB() {
        Guild_model_1.default.findOne({
            guildId: this.id,
        })
            .then((data) => {
            if (!data) {
                return Guild_model_1.default.create({
                    guildId: this.id,
                })
                    .then((data) => {
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
    getPrefix() {
        Guild_model_1.default.findOne({
            guildId: this.id,
        })
            .then((data) => { var _a; return (this.prefix = (_a = data.prefix) !== null && _a !== void 0 ? _a : "$"); })
            .catch(console.error);
        return this.prefix;
    }
    getMCAdress() {
        Guild_model_1.default.findOne({
            guildId: this.id,
        })
            .then((data) => (this.mcAdress = data.mcAdress))
            .catch(console.error);
        return this.mcAdress;
    }
    getModulesStatus() {
        Guild_model_1.default.findOne({
            guildId: this.id,
        })
            .then((data) => (this.modules = data.modules))
            .catch(console.error);
        return this.modules;
    }
    setPrefix(prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            if (prefix.length > 5)
                return Promise.resolve("Can't set a prefix longer than 4 characters");
            yield Guild_model_1.default.findOneAndUpdate({ guildId: this.id }, { prefix: prefix }, { new: true, upsert: true })
                .then((data) => (this.prefix = data.prefix))
                .catch((err) => Promise.reject(err));
            return Promise.resolve(`The new prefix is \`${this.prefix}\``);
        });
    }
    setMCAdress(adress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!adress)
                return Promise.resolve("Can't set a empty ip");
            yield Guild_model_1.default.findOneAndUpdate({ guildId: this.id }, { mcAdress: adress }, { new: true, upsert: true })
                .then((data) => (this.mcAdress = data.mcAdress))
                .catch((err) => Promise.reject(err));
            return Promise.resolve(`The new ip is \`${this.mcAdress}\``);
        });
    }
    setModulesStatus(modules) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Guild_model_1.default.findOneAndUpdate({ guildId: this.id }, { modules }, { new: true, upsert: true })
                .then((data) => (this.modules = data.modules))
                .catch((err) => Promise.reject(err));
            return Promise.resolve(true);
        });
    }
}
exports.default = GuildDB;
