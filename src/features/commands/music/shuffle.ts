import Command from "@handlers/Command";
import { Message } from "discord.js";
import Handler from "@handlers/Handler";
import { IArgs, Song, Utils } from "../../../Utils";
import TextChannelCS from "@models/discord/TextChannel";
import { Player, Track } from "@anonymousg/lavajs";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super("shuffle", {
            aliases: ["random"],
            permissions: ["PRIORITY_SPEAKER"],
            category: "music",
            description: "Shuffle the queue",
            usage: "No arguments",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const musicData = this.handler.player.getMusicData(message.guild!.id);
        if (!musicData) return channel.error("There is no music playing");
        if (!musicData.queue) return channel.error("No queue to shuffle");
        if (musicData.queue.length < 2) return channel.error("Cant shuffle 1 song");
        if (musicData.player.queue.repeatQueue) return channel.error("You cant shuffle while the queue is looping");

        const copy = [...musicData.queue];
        const playerQueueCopy = musicData.player.queue.KVArray().reduce((acc, val) => {
            acc.push(val[1]);
            return acc;
        }, [] as Track[]);
        playerQueueCopy.shift();
        musicData.player.queue.clearQueue();

        const queue = musicData.queue.map((val, index) => {
            const random = Utils.getRandom(copy.length, 0);
            // Add one because the index '0' in the player queue is the current song which is not the case with the queue. The queue first index (0) is the next song. So the player queue has a offset of 1
            musicData.player.queue.add(playerQueueCopy[random]);
            return copy.splice(random, 1)[0];
        });
        musicData.queue = queue;

        channel.success("Shuffled the queue");
    }

    private insertRandom(song: Song, queue: Song[], max: number, index: number, player: Player): Song[] {
        const pos = Math.floor(Math.random() * max);
        if (queue[pos]) return this.insertRandom(song, queue, max, index, player);

        player.queue.moveTrack(pos + 1, index);
        queue[pos] = song;
        return queue;
    }
};
