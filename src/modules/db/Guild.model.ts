import { Schema, model } from "mongoose";

const GuildSchema: Schema = new Schema({
    guildId: {
        type: String,
        required: true
    },
    prefix: {
        type: String,
        default: '$',
        required: false
    },
    mcAdress: {
        type: String,
        default: '',
        required: false
    }

    // logChannel: {
    //     type: String,
    //     default: null,
    //     required: false
    // }
});

const GuildModel = model('guild', GuildSchema);

export default GuildModel;