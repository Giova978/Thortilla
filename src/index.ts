import { Client, Structures } from "discord.js";
import { config } from "dotenv";
import * as path from "path";
import * as fs from "fs";
import Handler from "./handlers/Handler";
import { connect } from "mongoose";
import GuildDB from "./modules/discord/Guild";
import MemberDB from "./modules/discord/Member";

const dbUri = `mongodb://127.0.0.1:27017/thortilla`;

connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
.then((res: any) => console.log('✅ connected to database'))
.catch((err: any) => console.log(err));

Structures.extend('Guild', Guild => GuildDB);
Structures.extend('GuildMember', Member => MemberDB);

const client: Client = new Client({
    disableMentions: "everyone"
});

config({
    path: __dirname + '/.env'
});

const categories: Array<string> = fs.readdirSync(path.join(__dirname, './assets/commands/'));

const handler: Handler = new Handler(client, '$', categories);

handler.load(path.join(__dirname, './assets'), {
    client: client,
    handler: handler
});

client.on('error', (err) => {
    console.log('err');
});

process.on('SIGINT', () => process.exit());

client.login(process.env.TOKEN);
