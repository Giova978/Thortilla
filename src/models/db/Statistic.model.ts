import { Schema, model } from "mongoose";

const StatScheme: Schema = new Schema({
    userId: {
        type: String,
        required: true,
    },

    guildId: {
        type: String,
        required: true,
    },

    songUrl: {
        type: String,
        required: true,
    },

    songTitle: {
        type: String,
        required: true,
    },

    action: {
        type: String,
        required: true,
    },
});

const StatModel = model("member", StatScheme);

export default StatModel;
