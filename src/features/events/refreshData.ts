import Event from "../../handlers/Event";
import { Client, Message } from "discord.js";
import Handler from "../../handlers/Handler";
import { IArgs } from "../../Utils";
import GuildDB from "@/models/discord/Guild";

module.exports = class extends Event {
    public client: Client;
    public handler: Handler;

    constructor({ client, handler }: IArgs) {
        super("message", "required");

        this.client = client;
        this.handler = handler;
    }

    public async run(message: Message) {
        if (message.channel.id !== "757748622203814089") return;

        const guild = this.client.guilds.resolve(message.content)! as GuildDB;

        try {
            guild.getDataFromDB();
        } catch {
            return console.log(`Failed to get db data from ${guild ? guild.name : "No Guild"}`);
        }

        console.log(`Refreshed data from ${guild.name}`);
    }
};
