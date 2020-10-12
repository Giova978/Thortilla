import Command from "../../../handlers/Command";
import { Message } from "discord.js";
import Handler from "../../../handlers/Handler";
import { IArgs } from "../../../Utils";
import TextChannelCS from "../../../models/discord/TextChannel";

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super("pause", {
            aliases: ["stop"],
            category: "music",
            permissions: ["PRIORITY_SPEAKER"],
            description: "Pause the current song",
            usage: "No arguments",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const musicData = this.handler.player.getMusicData(message.guild!.id);
        if (message.member?.voice.channel !== musicData?.voiceChannel)
            return channel.error("You have to be in the same voice channel of the song");
        if (!musicData) return channel.error("There is no song playing");
        if (musicData.player.paused) return channel.error("The song is already paused");

        musicData.player.pause();
        channel.success("The song has been paused");
    }
};
