import * as fs from "fs";
import * as path from "path";
import { Message, Client, GuildMember, PermissionResolvable, TextChannel, VoiceChannel, Snowflake } from "discord.js";
import { Player } from "@anonymousg/lavajs";
import Handler from "./handlers/Handler";
import TextChannelCS from "./models/discord/TextChannel";

type ClearLog = {
    clearedBy: GuildMember;
    messagesAuthor?: GuildMember;
    clearedChannel: TextChannel;
    numberOfMessages: number;
};

type KickLog = {
    kickedMember: GuildMember;
    kickedBy: GuildMember;
    reason: string;
    date: Date;
};

type BanLog = {
    bannedMember: GuildMember;
    bannedBy: GuildMember;
    reason: string;
    date: Date;
};

type Song = {
    url: string;
    title: string;
    duration: string;
    thumbnail: string;
    durationSec: number;
    skipVoteUsers: string[];
};

interface IMusicData {
    guildId: Snowflake;
    player: Player;
    queue: Song[];
    volume: number;
    skipVotes: number;
    nowPlaying: Song | null;
    isPlaying: boolean;
    voiceChannel: VoiceChannel | null;
    textChannel: TextChannel | null;
    timeout: NodeJS.Timeout | null;
    lastTracks: [Song | null, Song?];
}

interface ICommand {
    name: string;
    aliases?: string[];
    permissions?: PermissionResolvable[];
    permissionsMe?: PermissionResolvable[];
    category: string;
    usage: string;
    description: string;

    run(message: Message, args: string[], channel: TextChannelCS): void;
}

interface IOptionsCommand {
    aliases?: Array<string>;
    permissions?: Array<PermissionResolvable>;
    permissionsMe?: PermissionResolvable[];
    category: string;
    usage: string;
    description: string;
    cooldown?: number;
}

interface IToggle {
    enabled: boolean;
    enable(): void;
    disable(): void;
    toggle(): void;
}

interface IEvent {
    eventName: string;
}

interface IArgs {
    client: Client;
    handler: Handler;
}

interface IRedditData {
    children: object;
}

interface IEmbedField {
    name: string;
    value: string;
    inline?: boolean;
}

class Utils {
    static readdirSyncRecursive(directory: any): string[] {
        let files: any[] = [];

        fs.readdirSync(directory).forEach((file) => {
            const fileLocation = path.join(directory, file);

            if (fs.lstatSync(fileLocation).isDirectory()) {
                files = [...files, ...Utils.readdirSyncRecursive(fileLocation)];
            } else {
                files.push(fileLocation);
            }
        });

        return files;
    }

    static getMember(message: Message, toFind: string = ""): GuildMember | undefined {
        toFind = toFind.toLowerCase();

        let target = message.guild?.members.cache.get(toFind);

        if (!target && message.mentions.members) target = message.mentions.members.first();

        if (!target && toFind) {
            target = message.guild?.members.cache.find((member) => {
                return (
                    member.displayName.toLowerCase().includes(toFind) || member.user.tag.toLowerCase().includes(toFind)
                );
            });
        }

        if (!target) target = undefined;

        return target;
    }

    static formatDate(date: Date | undefined | null): string | undefined {
        if (date === undefined || date === null) return undefined;
        return new Intl.DateTimeFormat("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "numeric",
            day: "numeric",
        }).format(date);
    }

    static formatTimestamp(timestamp: Date | undefined | null): string | undefined {
        if (!timestamp) return undefined;

        let date = new Date(timestamp);

        let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let day = days[date.getDay()];
        let monthDay = date.getDate() > 10 ? date.getDate() : `0${date.getDate()}`;
        let month: string | number = date.getMonth();
        month = month >= 10 ? month : `0${month}`;
        let year = date.getFullYear();

        let dateFormatted = `${day}, ${monthDay}/${month}/${year}`;

        return dateFormatted;
    }
}

export {
    Utils,
    ICommand,
    IOptionsCommand,
    IToggle,
    IEvent,
    IArgs,
    IRedditData,
    IEmbedField,
    IMusicData,
    Song,
    ClearLog,
    BanLog,
    KickLog,
};
