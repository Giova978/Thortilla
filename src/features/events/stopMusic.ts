import Event from "../../handlers/Event";
import { Client, VoiceState } from "discord.js";
import Handler from "../../handlers/Handler";
import { IArgs } from "../../Utils";
import GuildDB from "@models/discord/Guild";

module.exports = class extends Event {
    public client: Client;
    public handler: Handler;

    constructor({ client, handler }: IArgs) {
        super("voiceStateUpdate", "music");

        this.client = client;
        this.handler = handler;
    }

    public async run(oldState: VoiceState, newState: VoiceState) {
        const guild: GuildDB = oldState.guild as GuildDB;
        const musicData = this.handler.player.getMusicData(guild.id);

        if (!musicData) return;
        if (oldState.channelID !== musicData.voiceChannel?.id) return;
        if (!oldState.channel) return;

        const trueMembers = oldState.channel.members.filter((member) => !member.user.bot);
        if (trueMembers.size > 0) return;

        musicData.player.destroy();
    }
};
