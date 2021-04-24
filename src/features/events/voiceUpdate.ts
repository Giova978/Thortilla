import Event from "../../handlers/Event";
import { Client, Message, MessageEmbed } from "discord.js";
import Handler from "../../handlers/Handler";
import { IArgs } from "../../Utils";
import { VoicePacket } from "erela.js";

module.exports = class extends Event {
    public client: Client;
    public handler: Handler;

    constructor({ client, handler }: IArgs) {
        // @ts-expect-error
        super("raw", "required");

        this.client = client;
        this.handler = handler;
    }

    public async run(d: unknown) {
        if (this.handler.manager) {
            this.handler.manager.updateVoiceState(d as VoicePacket);
        }
    }
}