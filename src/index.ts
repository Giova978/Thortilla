import { Client, Structures } from "discord.js";
import { config } from "dotenv";
import * as path from "path";
import { readdirSync } from "fs";
import Handler from "./handlers/Handler";
import { connect } from "mongoose";

// Models imports
import GuildDB from "./models/discord/Guild";
import MemberDB from "./models/discord/Member";
import TextChannelCS from "./models/discord/TextChannel";
import NewsChannelCS from "./models/discord/NewsChannel";
import DMChannelCS from "./models/discord/DMChannel";

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

const categories: Array<string> = readdirSync(path.join(__dirname, "./assets/commands/")).filter(
    (cat) => cat !== "debug",
);

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
