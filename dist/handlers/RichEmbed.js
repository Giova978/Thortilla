"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class Embed {
    constructor() {
        this.embed = new discord_js_1.MessageEmbed();
    }
    addFields(fields) {
        for (const field of fields) {
            let { name, value, inline = false } = field;
            this.embed.addField(name, value, inline);
        }
    }
}
exports.default = Embed;
