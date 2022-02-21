import Event from "../../handlers/Event";
import { Manager } from "erela.js";
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

        this.handler.manager = new Manager({
            nodes: this.handler.nodes,
            shards: 1,
            autoPlay: false,
            send: (id, payload) => {
                const guild = this.handler.client.guilds.cache.get(id);
                if (guild) guild.shard.send(payload);
            },
        })
            .on("nodeConnect", () => {
                console.log("Connected to lavalink");
            })
            .on("nodeDisconnect", () => {
                console.log("Disconnect");
            })
            .on("nodeError", (node, error) => {
                this.handler.logger.error(`Lavalink 'nodeError`, node, error);
                console.log(error);
            })
            .init(this.handler.client.user!.id);

        this.handler.player = new Player(this.handler.manager, this.handler);
    }
};
