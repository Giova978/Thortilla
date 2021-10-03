import { Collection, GuildMember, TextChannel } from "discord.js";
import { Snowflake, MessageEmbed } from "discord.js";
import { IMusicData, Song, Utils } from "../Utils";

import { Manager, PlayerOptions, Player as erelaPlayer, Track } from "erela.js";
import { Message } from "discord.js";
import Handler from "./Handler";
import { VoiceChannel } from "discord.js";

export default class Player {
    private readonly handler: Handler;
    private readonly manager: Manager;
    private readonly queueOptions = {
        repeatTrack: false,
        repeatQueue: false,
        skipOnError: false,
    };
    public readonly guildsMusicData: Collection<Snowflake, IMusicData> = new Collection();

    constructor(manager: Manager, handler: Handler) {
        this.manager = manager;
        this.handler = handler;
        this.setListeners();
    }

    public initPlayer(guildId: Snowflake, message: Message, voiceChannel: VoiceChannel) {
        if (this.guildsMusicData.has(guildId)) return;

        const player = this.manager.create(this.options(message, voiceChannel));
        player.setQueueRepeat(this.queueOptions.repeatQueue);
        player.setTrackRepeat(this.queueOptions.repeatTrack);
        player.connect();

        this.guildsMusicData.set(guildId, this.initMusicData(guildId, player, voiceChannel, message));
    }

    public getMusicData(guildId: Snowflake) {
        return this.guildsMusicData.get(guildId)!;
    }

    public async add(guildId: Snowflake, member: GuildMember, song: Song) {
        let data = this.getMusicData(guildId);

        let songs;
        try {
            // For some reason LavaJS takes add: false as true so it add the song automatically
            songs = (await data.player.search(song.url, member!)).tracks;
        } catch (error) {
            this.handler.logger.error(`Error at adding song at guild ${guildId}, song: ${song.url}`, error);
            return Promise.reject("Fail to add");
        }
        if (!songs) return Promise.reject("Fail to add");

        data.queue.push(song);
        if (data.player.queueRepeat) {
            // Extract the penultimate song and stores it for repeat
            const repeatingSong = data.queue.splice(data.queue.length - 2, 1)[0];

            data.queue.push(repeatingSong);
        }

        data.player.queue.add(songs[0]);

        this.guildsMusicData.set(guildId, data);
    }

    public play(guildId: Snowflake) {
        let data = this.getMusicData(guildId);

        if (data.timeout) clearTimeout(data.timeout);

        if (!data.isPlaying) {
            data.player.setVolume(data.volume);
            data.player.play();
            data.isPlaying = true;
        }

        this.guildsMusicData.set(guildId, data);
    }

    public skip(guildId: Snowflake, index: number = 0) {
        let data = this.getMusicData(guildId);

        if (index > 0) {
            const movedSong = data.player.queue.remove(index - 1)[0];
            data.player.queue.add(movedSong, 0);

            // How we add one (In the queue command for better human reading) now we have to subtract so it matches a true position in the musicData#queue array
            const song = data.queue.splice(index - 1, 1)[0];

            data.queue.unshift(song);

            this.guildsMusicData.set(guildId, data);
        }

        data.player.stop();
    }

    private initMusicData(
        guildId: Snowflake,
        player: erelaPlayer,
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
            guild: message.guild!.id,
            textChannel: message.channel.id,
            voiceChannel: voiceChannel.id,
            volume: 50,
            selfDeafen: true,
        };
    };

    private leave(guildId: Snowflake, player: erelaPlayer) {
        let data = this.getMusicData(guildId);
        data.isPlaying = false;
        data.nowPlaying = null;

        data.timeout = setTimeout(() => {
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
        const songs = (await musicData.player.search(lastTrack.url, member)).tracks;

        musicData.player.queue.add(songs[0]);

        const movedSong = musicData.player.queue.remove(musicData.player.queue.size - 1)[0];
        musicData.player.queue.add(movedSong);

        this.skip(guildId);
    }

    public loopQueue(guildId: Snowflake) {
        const { player, queue, nowPlaying } = this.getMusicData(guildId);

        if (player.queueRepeat) {
            queue.pop();
            return player.setQueueRepeat(false).queueRepeat;
        } else {
            if (queue[queue.length - 1]?.url !== nowPlaying?.url) queue.push(nowPlaying!);
            return player.setQueueRepeat(true).queueRepeat;
        }
    }

    public loopTrack(guildId: Snowflake) {
        const { player } = this.getMusicData(guildId);

        if (player.trackRepeat) {
            return player.setTrackRepeat(false).trackRepeat;
        } else {
            return player.setTrackRepeat(true).trackRepeat;
        }
    }

    public shuffle(guildId: Snowflake) {
        const musicData = this.getMusicData(guildId);
        const copy = [...musicData.queue];
        const playerQueueCopy = musicData.player.queue.reduce((acc, val) => {
            acc.push(val as Track);
            return acc;
        }, [] as Track[]);
        musicData.player.queue.clear();

        const shuffledQueue = musicData.queue.map(() => {
            const random = Utils.getRandom(copy.length, 0);

            musicData.player.queue.add(playerQueueCopy[random]);
            return copy.splice(random, 1)[0];
        });

        musicData.queue = shuffledQueue;

        this.guildsMusicData.set(guildId, musicData);
    }

    private setListeners() {
        let musicData;
        let queue;
        let channel;

        this.manager
            .on("trackStart", (player) => {
                musicData = this.getMusicData(player.options.guild);
                queue = musicData.queue;
                channel = musicData.textChannel;

                if (!queue[0] || musicData.player.trackRepeat) return;
                // The first song will be null so we push the current song
                musicData.lastTracks.push(queue[0]);

                // When the queue hits 3 of length that means that the structure is [PastSong, LastSong, CurrentSong] so we remove PastSong
                if (musicData.lastTracks.length > 2) musicData.lastTracks.shift();

                musicData.skipVotes = 0;
                musicData.isPlaying = true;

                const embed = new MessageEmbed()
                    .setTitle("Current Song")
                    .setColor("GREEN")
                    .addField("Now playing", `[${queue[0].title}](${queue[0].url})`)
                    .addField("Duration", queue[0].duration);

                if (queue[0].thumbnail) embed.setThumbnail(queue[0].thumbnail);
                if (queue[1]) embed.addField("Next song", queue[1].title);
                channel!.send(embed);

                musicData.nowPlaying = queue[0];

                if (player.queueRepeat) {
                    queue.push(queue.shift()!);
                } else {
                    queue.shift();
                }

                this.guildsMusicData.set(player.options.guild, musicData);
            })
            .on("trackEnd", (player) => {
                musicData = this.getMusicData(player.options.guild);
                queue = musicData.queue;

                if (!musicData.player.trackRepeat) musicData.lastTracks.shift();

                if (queue.length > 0) {
                    player.play();
                } else {
                    this.leave(player.options.guild, player);
                }
            })
            .on("queueEnd", (player) => {
                musicData = this.getMusicData(player.options.guild);
                queue = musicData.queue;
                musicData.lastTracks.shift();

                if (queue.length > 0) {
                    player.play();
                } else {
                    this.leave(player.options.guild, player);
                }
            })
            .on("trackError", (player, track, err) => {
                musicData = this.getMusicData(player.options.guild);
                queue = musicData.queue;
                channel = musicData.textChannel;

                this.handler.logger.error(`Error 'trackError', track: ${track?.uri}, guild: ${player.guild}`, err);
                player.stop();
                channel!.send("There was a problem with the playback");
                if (queue.length > 0) {
                    player.play();
                } else {
                    this.leave(player.options.guild, player);
                }
            })
            .on("trackStuck", (player, track, err) => {
                musicData = this.getMusicData(player.options.guild);
                queue = musicData.queue;
                channel = musicData.textChannel;

                this.handler.logger.error(`Error 'trackStuck', track: ${track?.uri}, guild: ${player.guild}`, err);
                player.stop();
                channel!.send("There was a problem with the playback");
                if (queue.length > 0) {
                    player.play();
                } else {
                    this.leave(player.options.guild, player);
                }
            })
            .on("playerDestroy", (player) => {
                this.guildsMusicData.delete(player.guild);
            })
            .on("playerMove", (player, initChannel, newChannel) => {
                const musicData = this.getMusicData(player.guild);

                musicData.voiceChannel = this.handler.client.guilds.cache.get(player.guild)?.voice?.channel ?? null;
            });
    }
}
