import Event from "../../handlers/Event";
import { Client, VoiceState } from "discord.js";
import Handler from "../../handlers/Handler";
import { IArgs } from "../../Utils";
import GuildDB from "@models/discord/Guild";
import { LavaNode } from "@anonymousg/lavajs";

module.exports = class extends Event {
    public client: Client;
    public handler: Handler;

    constructor({ client, handler }: IArgs) {
        super("voiceStateUpdate", "balance");

        this.client = client;
        this.handler = handler;
    }

    public async run(oldState: VoiceState, newState: VoiceState) {
        const guild: GuildDB = oldState.guild as GuildDB;
        const musicData = this.handler.player.getMusicData(guild.id);

        if (oldState.channelID === musicData.voiceChannel?.id && newState.channel!.members.size < 0) {
            musicData.player.destroy();

            new LavaNode(this.handler.lavaClient, this.handler.nodes[0]).wsSend({
                op: "leave",
                guild_id: guild.id,
            });

            this.handler.player.guildsMusicData.delete(guild.id);
        }
    }
};
