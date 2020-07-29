"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const Handler_1 = __importDefault(require("./handlers/Handler"));
const mongoose_1 = require("mongoose");
const Guild_1 = __importDefault(require("./modules/discord/Guild"));
const Member_1 = __importDefault(require("./modules/discord/Member"));
dotenv_1.config({
    path: __dirname + "/.env",
});
const dbUri = process.env.DBURI;
// @ts-ignore
mongoose_1.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})
    .then((res) => console.log("✅ connected to database"))
    .catch((err) => console.log(err));
discord_js_1.Structures.extend("Guild", (Guild) => Guild_1.default);
discord_js_1.Structures.extend("GuildMember", (Member) => Member_1.default);
const client = new discord_js_1.Client({
    disableMentions: "everyone",
});
const categories = fs.readdirSync(path.join(__dirname, "./assets/commands/"));
const handler = new Handler_1.default(client, "$", categories);
handler.load(path.join(__dirname, "./assets"), {
    client: client,
    handler: handler,
});
client.on("error", (err) => {
    console.log("err");
});
process.on("SIGINT", () => process.exit());
client.login(process.env.TOKEN);
