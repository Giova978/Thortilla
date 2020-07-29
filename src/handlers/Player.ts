import { Collection } from "discord.js";
import { Snowflake, MessageEmbed } from "discord.js";
import { IMusicaData, Song } from "../Utils";

import Lava, { LavaNode, PlayerOptions } from "@anonymousg/lavajs";
import { Message } from "discord.js";
import Handler from "./Handler";
import { VoiceChannel } from "discord.js";

export default class Player {
    private readonly handler: Handler;
    private readonly lavaClient: Lava.LavaClient;
    private readonly queueOptions = {
        repeatTrack: false,
        repeatQueue: false,
        skipOnError: false,
    };
    public readonly guildsMusicData: Collection<Snowflake, IMusicaData> = new Collection();

    constructor(lavaClient: Lava.LavaClient, handler: Handler) {
        this.lavaClient = lavaClient;
        this.handler = handler;
        this.setListeners();
    }

    public initPlayer(guildId: Snowflake, message: Message, voiceChannel: VoiceChannel) {
        const player = this.lavaClient.spawnPlayer(this.options(message, voiceChannel), this.queueOptions);

        if (!this.guildsMusicData.has(guildId)) {
            this.guildsMusicData.set(guildId, this.initMusicData(guildId, player, voiceChannel, message));
        }
    }

    public getMusicaData(guildId: Snowflake) {
        return this.guildsMusicData.get(guildId)! ?? {};
    }

    public async add(guildId: Snowflake, message: Message, song: Song) {
        let data = this.getMusicaData(guildId);

        data.queue.push(song);

        const songs = await data.player.lavaSearch(song.url, message.author, { add: true });

        // @ts-ignore
        data.player.queue.add(songs[0]);

        this.guildsMusicData.set(guildId, data);
    }

    public play(guildId: Snowflake) {
        let data = this.getMusicaData(guildId);

        if (data.timeout) clearTimeout(data.timeout);

        if (!data.isPlaying) {
            data.player.play();
            data.isPlaying = true;
        }

        this.guildsMusicData.set(guildId, data);
    }

    public skip(guildId: Snowflake, index: number = 0) {
        let data = this.getMusicaData(guildId);

        if (index > 0) {
            data.player.queue.moveTrack(index, 1);

            data.queue.unshift(data.queue[index]);
        }

        data.player.play();
    }

    private initMusicData(guildId: Snowflake, player: Lava.Player, voiceChannel: VoiceChannel, message: Message): IMusicaData {
        return {
            guildId: guildId,
            player: player,
            queue: [],
            volume: 50,
            skipVotes: 0,
            nowPlaying: null,
            isPlaying: false,
            voiceChannel: voiceChannel,
            // @ts-ignore
            textChannel: message.channel,
            timeout: null,
        };
    }

    private options = (message: Message, voiceChannel: VoiceChannel): PlayerOptions => {
        return {
            guild: message.guild!,
            // @ts-ignore
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            volume: 50,
            deafen: true,
        };
    };

    private leave(guildId: Snowflake, player: Lava.Player) {
        let data = this.getMusicaData(guildId);
        data.isPlaying = false;

        data.timeout = setTimeout(() => {
            // @ts-ignore
            new LavaNode(this.handler.lavaClient, this.handler.nodes[0]).wsSend({
                op: "leave",
                guil_id: guildId,
            });

            player.destroy();

            this.guildsMusicData.delete(guildId);
        }, 300000);

        this.guildsMusicData.set(guildId, data);
    }

    private setListeners() {
        let musicData;
        let queue;
        let channel;

        this.lavaClient
            .on("trackPlay", (track, player) => {
                musicData = this.getMusicaData(player.options.guild.id);
                queue = musicData.queue;
                channel = musicData.textChannel;

                if (!queue[0]) return;

                musicData.skipVotes = 0;
                player.setVolume(musicData.volume);

                const embed = new MessageEmbed().setTitle("Current Song").setColor("GREEN").addField("Now playing", `[${queue[0].title}](${queue[0].url})`).addField("Duration", queue[0].duration);

                if (queue[0].thumbnail) embed.setThumbnail(queue[0].thumbnail);
                if (queue[1]) embed.addField("Next song", queue[1].title);
                channel!.send(embed);

                musicData.nowPlaying = queue[0];
                queue.shift();

                this.guildsMusicData.set(player.options.guild.id, musicData);
            })
            .on("trackOver", (track, player) => {
                musicData = this.getMusicaData(player.options.guild.id);
                queue = musicData.queue;

                if (queue.length > 0) {
                    player.play();
                } else {
                    this.leave(player.options.guild.id, player);
                }
            })
            .on("queueOver", (player) => {
                musicData = this.getMusicaData(player.options.guild.id);
                queue = musicData.queue;

                if (queue.length > 0) {
                    player.play();
                } else {
                    this.leave(player.options.guild.id, player);
                }
            })
            .on("trackError", (track, player, err) => {
                musicData = this.getMusicaData(player.options.guild.id);
                queue = musicData.queue;
                channel = musicData.textChannel;

                console.error("Error", err);
                player.stop();
                channel!.send("There was a problem with the playback");
                if (queue.length < 1) {
                    this.leave(player.options.guild.id, player);
                } else {
                    player.play();
                }
            });
    }
}
