import Command from "../../../handlers/Command";
import { Message } from "discord.js";
import { IArgs } from "../../../Utils";
import Handler from "../../../handlers/Handler";
import TextChannelCS from "../../../models/discord/TextChannel";

module.exports = class extends Command {
    private readonly handler: Handler;

    constructor({ handler }: IArgs) {
        super("timestamp", {
            aliases: ["seek", "ts"],
            category: "music",
            permissions: ["PRIORITY_SPEAKER"],
            description: "Skip to the given timestamp",
            usage: "<timestamp(format m:s)>",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const musicData = this.handler.player.getMusicData(message.guild!.id);
        if (!musicData) return channel.error("There is no song playing");

        const time = args[0];
        if (!time) return channel.error("Give a timestamp");

        const [minutes, seconds] = time.split(":");

        if (!minutes) return channel.error("Give a good formated timestamp");
        if (!time) return channel.error("Give a good formated timestamp");

        const timeToSkip = (parseInt(minutes) * 60 + parseInt(seconds)) * 1000;

        if (timeToSkip >= musicData.nowPlaying?.durationSec! * 1000)
            return channel.error("Please provide a valid timestamp");

        musicData.player.seek(timeToSkip);

        channel.success(`Skipped to ${time}`);
    }
};
