import { Client, Structures } from "discord.js";
import { config } from "dotenv";
import * as path from "path";
import * as fs from "fs";
import Handler from "./handlers/Handler";
import { connect } from "mongoose";
import GuildDB from "./modules/discord/Guild";
import MemberDB from "./modules/discord/Member";
import TextChannelCS from "./modules/discord/TextChannel";
import NewsChannelCS from "./modules/discord/NewsChannel";
import DMChannelCS from "./modules/discord/DMChannel";

config({
    path: __dirname + "/.env",
});

const dbUri = process.env.DBURI;

// @ts-ignore
connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})
    .then((res: any) => console.log("✅ connected to database"))
    .catch((err: any) => console.log(err));

Structures.extend("Guild", (Guild) => GuildDB);
Structures.extend("GuildMember", (Member) => MemberDB);
Structures.extend("TextChannel", (TextChannel) => TextChannelCS);
Structures.extend("NewsChannel", (NewsChannel) => NewsChannelCS);
Structures.extend("DMChannel", (DMChannel) => DMChannelCS);

const client: Client = new Client({
    disableMentions: "everyone",
});

const categories: Array<string> = fs.readdirSync(
    path.join(__dirname, "./assets/commands/")
).filter((cat) => cat !== "debug")

const handler: Handler = new Handler(client, "$", categories);

handler.load(path.join(__dirname, "./assets"), {
    client: client,
    handler: handler,
});

client.on("error", (err) => {
    console.log("err");
});

process.on("SIGINT", () => process.exit());

client.login(process.env.TOKEN);
