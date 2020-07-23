"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
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
console.log(process.env.NODE_ENV);
// client.login(process.env.TOKEN);
