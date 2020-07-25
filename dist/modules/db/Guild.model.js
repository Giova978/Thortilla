"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const GuildSchema = new mongoose_1.Schema({
    guildId: {
        type: String,
        required: true,
    },
    prefix: {
        type: String,
        default: "$",
        required: false,
    },
    mcAdress: {
        type: String,
        default: "",
        required: false,
    },
    modules: {
        type: Object,
        default: {
            config: true,
            debug: false,
            fun: true,
            info: true,
            moderation: true,
            music: true,
            balance: true,
        },
        required: false,
    },
});
const GuildModel = mongoose_1.model("guild", GuildSchema);
exports.default = GuildModel;
