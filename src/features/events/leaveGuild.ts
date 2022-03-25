import Event from "../../handlers/Event";
import { Client, Guild } from "discord.js";
import Handler from "../../handlers/Handler";
import { IArgs } from "../../Utils";

module.exports = class extends Event {
    public client: Client;
    public handler: Handler;

    constructor({ client, handler }: IArgs) {
        super("guildDelete", "required");

        this.client = client;
        this.handler = handler;
    }

    public async run(guild: Guild) {
        if (!guild.id) return;
        const { player, isPlaying } = this.handler.player.getMusicData(guild.id);
        if (isPlaying) player.destroy();
    }
};
