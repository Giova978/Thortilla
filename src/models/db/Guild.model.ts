import { Schema, model } from "mongoose";

const GuildSchema = new Schema({
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
            tags: true,
        },
        required: true,
    },

    tags: {
        type: Map,
        of: String,
        default: new Map(),
    },

    tagPrefix: {
        type: String,
        default: "¿",
    },

    logChannel: {
        type: String,
        default: null,
        required: false,
    },
});

const GuildModel = model("guild", GuildSchema);

export default GuildModel;
