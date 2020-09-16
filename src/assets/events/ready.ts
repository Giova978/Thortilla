import Event from "../../handlers/Event";
import { LavaClient, LavaNode } from "@anonymousg/lavajs";
import { Client } from "discord.js";
import Handler from "../../handlers/Handler";
import { IArgs } from "../../Utils";
import Player from "../../handlers/Player";

module.exports = class extends Event {
    public client: Client;
    public handler: Handler;

    constructor({ client, handler }: IArgs) {
        super("ready", "required");

        this.client = client;
        this.handler = handler;
    }

    public async run() {
        this.client.user?.setPresence({
            activity: {
                name: "$",
                type: "WATCHING",
            },
        });

        console.log(`Bot Online`);

        this.handler.lavaClient = new LavaClient(
            this.client,
            // @ts-ignore
            this.handler.nodes
        );

        this.handler.lavaClient.on('nodeSuccess', () => {
            console.log('Connected to lavalink');
        })

        this.handler.player = new Player(this.handler.lavaClient, this.handler);
    }
};
