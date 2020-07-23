"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MemberSchema = new mongoose_1.Schema({
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
const MemberModel = mongoose_1.model('member', MemberSchema);
exports.default = MemberModel;
