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
const Command_1 = __importDefault(require("../../../handlers/Command"));
const discord_js_1 = require("discord.js");
const Utils_1 = require("../../../Utils");
module.exports = class extends Command_1.default {
    constructor() {
        super("userinfo", {
            aliases: ["whois", "id"],
            category: "info",
            description: "Send the user info",
            usage: "[user]",
        });
    }
    run(message, args) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            const member = (Utils_1.Utils.getMember(message, args[0]) || message.member);
            let roles = (_a = member) === null || _a === void 0 ? void 0 : _a.roles.cache.map((role) => `<@&${role.id}>`);
            // Remove @everyone from roles
            (_b = roles) === null || _b === void 0 ? void 0 : _b.pop();
            if (!((_c = roles) === null || _c === void 0 ? void 0 : _c.length))
                roles = ["None"];
            const embed = new discord_js_1.MessageEmbed()
                .setColor("GREEN")
                .setTitle("User Info")
                .addField("**Username**", (_d = member) === null || _d === void 0 ? void 0 : _d.user.username, true)
                .addField("**Nickname**", ((_e = member) === null || _e === void 0 ? void 0 : _e.nickname) || "None", true)
                .addField("**Identifier**", `#${(_f = member) === null || _f === void 0 ? void 0 : _f.user.discriminator}`, true)
                .addField("**Account Created At**", Utils_1.Utils.formatTimestamp((_g = member) === null || _g === void 0 ? void 0 : _g.user.createdAt), true)
                .addField("**Joined At**", Utils_1.Utils.formatTimestamp((_h = member) === null || _h === void 0 ? void 0 : _h.joinedAt), true)
                .addField("**Roles**", roles.join(" "))
                .addField("**Avatar**", `[**Avatar URL**](${member.user.displayAvatarURL({ dynamic: false })})`, true)
                .addField("**Balance**", `${member.getBalance()} coins`, true)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: false }));
            message.channel.send(embed);
        });
    }
};
