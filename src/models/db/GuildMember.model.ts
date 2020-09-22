import { Schema, model } from "mongoose";

const MemberSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true
    },
    
    guildId: {
        type: String,
        required: true
    },

    coins: {
        type: Number,
        default: 0,
        required: false,
    }
});

const MemberModel = model('member', MemberSchema);

export default MemberModel;