import { Collection, GuildMember, TextChannel } from "discord.js";
import { Snowflake, MessageEmbed } from "discord.js";
import { IMusicData, Song } from "../Utils";

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
    public readonly guildsMusicData: Collection<Snowflake, IMusicData> = new Collection();

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

    public getMusicData(guildId: Snowflake) {
        return this.guildsMusicData.get(guildId)!;
    }

    public async add(guildId: Snowflake, member: GuildMember, song: Song) {
        let data = this.getMusicData(guildId);

        data.queue.push(song);

        // For some reason LavaJS takes add: false as true so it add the song automatically
        const songs = (await data.player.lavaSearch(song.url, member!, { add: true })) as Lava.Track[];

        data.player.queue.add(songs[0]);

        this.guildsMusicData.set(guildId, data);
    }

    public play(guildId: Snowflake) {
        let data = this.getMusicData(guildId);

        if (data.timeout) clearTimeout(data.timeout);

        if (!data.isPlaying) {
            data.player.play();
            data.isPlaying = true;
        }

        this.guildsMusicData.set(guildId, data);
    }

    public skip(guildId: Snowflake, index: number = 0) {
        let data = this.getMusicData(guildId);

        if (index > 0) {
            data.player.queue.moveTrack(index, 1);

            // Like we add one now we have to subtract so it matches a true position in the musicData#queue array
            const song = data.queue.splice(index - 1, 1)[0];

            data.queue.unshift(song);

            this.guildsMusicData.set(guildId, data);
        }

        data.player.play();
    }

    private initMusicData(
        guildId: Snowflake,
        player: Lava.Player,
        voiceChannel: VoiceChannel,
        message: Message,
    ): IMusicData {
        return {
            guildId: guildId,
            player: player,
            queue: [],
            volume: 100,
            skipVotes: 0,
            nowPlaying: null,
            isPlaying: false,
            voiceChannel: voiceChannel,
            textChannel: message.channel as TextChannel,
            timeout: null,
            lastTracks: [null],
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
        let data = this.getMusicData(guildId);
        data.isPlaying = false;
        data.nowPlaying = null;

        data.timeout = setTimeout(() => {
            new LavaNode(this.handler.lavaClient, this.handler.nodes[0]).wsSend({
                op: "leave",
                guild_id: guildId,
            });

            player.destroy();
            this.guildsMusicData.delete(guildId);
        }, 300000);

        this.guildsMusicData.set(guildId, data);
    }

    public async playLastTrack(guildId: Snowflake, member: GuildMember) {
        const musicData = this.getMusicData(guildId);
        if (!musicData.lastTracks[0]) return;

        const lastTrack = musicData.lastTracks[0];
        musicData.queue.unshift(lastTrack);

        // For some reason LavaJS takes add: false as true so it add the song automatically
        const songs = (await musicData.player.lavaSearch(lastTrack.url, member, { add: true })) as Lava.Track[];

        musicData.player.queue.add(songs[0]);

        musicData.player.queue.moveTrack(musicData.player.queue.size - 1, 1);

        this.skip(guildId);
    }

    public loopQueue(guildId: Snowflake) {
        const { player, queue, nowPlaying } = this.getMusicData(guildId);

        if (player.queue.repeatQueue) {
            return (player.queue.repeatQueue = false);
        } else {
            if (queue[queue.length - 1]?.url !== nowPlaying?.url) queue.push(nowPlaying!);
            return player.queue.toggleRepeat("queue");
        }
    }

    public loopTrack(guildId: Snowflake) {
        const { player } = this.getMusicData(guildId);

        if (player.queue.repeatTrack) {
            return (player.queue.repeatTrack = false);
        } else {
            return player.queue.toggleRepeat("track");
        }
    }

    private setListeners() {
        let musicData;
        let queue;
        let channel;

        this.lavaClient
            .on("trackPlay", (track, player) => {
                musicData = this.getMusicData(player.options.guild.id);
                queue = musicData.queue;
                channel = musicData.textChannel;

                if (!queue[0]) return;
                // The first song will be null so we push the current song
                musicData.lastTracks.push(queue[0]);

                // When the queue hits 3 of length that means that the structure is [PastSong, LastSong, CurrentSong] so we remove PastSong
                if (musicData.lastTracks.length > 2) musicData.lastTracks.shift();

                musicData.skipVotes = 0;
                musicData.isPlaying = true;
                player.setVolume(musicData.volume);

                const embed = new MessageEmbed()
                    .setTitle("Current Song")
                    .setColor("GREEN")
                    .addField("Now playing", `[${queue[0].title}](${queue[0].url})`)
                    .addField("Duration", queue[0].duration);

                if (queue[0].thumbnail) embed.setThumbnail(queue[0].thumbnail);
                if (queue[1]) embed.addField("Next song", queue[1].title);
                channel!.send(embed);

                musicData.nowPlaying = queue[0];
                if (player.queue.repeatQueue) {
                    queue.push(queue.shift()!);
                } else {
                    queue.shift();
                }

                this.guildsMusicData.set(player.options.guild.id, musicData);
            })
            .on("trackOver", (track, player) => {
                musicData = this.getMusicData(player.options.guild.id);
                queue = musicData.queue;

                if (!musicData.player.queue.repeatTrack) musicData.lastTracks.shift();

                if (queue.length > 0) {
                    player.play();
                } else {
                    this.leave(player.options.guild.id, player);
                }
            })
            .on("queueOver", (player) => {
                musicData = this.getMusicData(player.options.guild.id);
                queue = musicData.queue;
                musicData.lastTracks.shift();

                if (queue.length > 0) {
                    player.play();
                } else {
                    this.leave(player.options.guild.id, player);
                }
            })
            .on("trackError", (track, player, err) => {
                musicData = this.getMusicData(player.options.guild.id);
                queue = musicData.queue;
                channel = musicData.textChannel;

                this.handler.logger.error("Error", err);
                player.stop();
                channel!.send("There was a problem with the playback");
                if (queue.length > 0) {
                    player.play();
                } else {
                    this.leave(player.options.guild.id, player);
                }
            })
            .on("trackStuck", (track, player, err) => {
                musicData = this.getMusicData(player.options.guild.id);
                queue = musicData.queue;
                channel = musicData.textChannel;

                this.handler.logger.error("Error", err);
                player.stop();
                channel!.send("There was a problem with the playback");
                if (queue.length > 0) {
                    player.play();
                } else {
                    this.leave(player.options.guild.id, player);
                }
            });
    }
}
