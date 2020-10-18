import Command from "../../../handlers/Command";
import { Message, MessageEmbed, User, MessageReaction } from "discord.js";
import Handler from "../../../handlers/Handler";
import { IArgs } from "../../../Utils";
import TextChannelCS from "../../../models/discord/TextChannel";
import GuildDB from "@/models/discord/Guild";
import { stripIndents } from "common-tags";

module.exports = class extends Command {
    private handler: Handler;

    constructor({ handler }: IArgs) {
        super("tag", {
            category: "tags",
            description:
                "Command used to manipulate tags, to see the content of a tag use ¿<tag name>.The bot will send a message and you will be asked to give the new content",
            permissions: ["MANAGE_GUILD"],
            usage: stripIndents`\u200B
            <tag name> [edit | delete | create]
            tag <tag name> create
            tag <tag name> edit
            tag <tag name> delete
            `,
            cooldown: 2,
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[], channel: TextChannelCS) {
        const tagName = args[0];
        if (!tagName) return channel.error("Please give a valid tag name");

        const operation = args[1];
        if (!operation || !["edit", "delete", "create"].includes(operation))
            return channel.error("Please give a valid action(`edit | delete | create`)");

        const guild: GuildDB = message.guild as GuildDB;

        switch (operation) {
            case "edit":
                this.editTag(tagName, guild, message);
                break;

            case "create":
                await this.createTag(tagName, guild, message);
                break;

            case "delete":
                this.deleteTag(tagName, guild, message);
                break;

            default:
                channel.error("Action not recognized", 1000);
                break;
        }
    }

    private getTag(tagName: string, guild: GuildDB) {
        return guild.getTags.get(tagName);
    }

    private async createTag(tagName: string, guild: GuildDB, message: Message) {
        const embed = new MessageEmbed()
            .setColor("BLUE")
            .setTitle(`Creating tag \`${tagName}\``)
            .setDescription("Initated process of creating a tag, you will have 2 minutes to respond with the content");

        const filter = (msg: Message) => msg.author === message.author;
        const collector = message.channel.createMessageCollector(filter, { time: 3 * 60 * 1000, max: 1 });

        const msg = await message.channel.send(embed);

        collector.on("end", (collected, reason) => {
            const content = collected.first()?.content;
            if (!content) {
                embed
                    .setColor("RED")
                    .setTitle(`Failed to create tag \`${tagName}\``)
                    .setDescription("No valid content provided");

                return msg.edit(embed);
            }

            const tags = guild.getTags;

            tags.set(tagName, content!);

            guild
                .setTags(tags)
                .then(() => {
                    embed
                        .setColor("GREEN")
                        .setTitle(`Created tag \`${tagName}\``)
                        .setDescription(`Successfully created \`${tagName}\` with the provided content`);

                    msg.edit(embed);
                })
                .catch((err) => {
                    embed
                        .setColor("RED")
                        .setTitle(`Failed to create \`${tagName}\``)
                        .setDescription(
                            `Something went wrong while creating \`${tagName}\` tag, please try again later`,
                        );

                    msg.edit(embed);
                    this.handler.logger.error(err);
                });
        });
    }

    private async editTag(tagName: string, guild: GuildDB, message: Message) {
        const tag = this.getTag(tagName, guild);
        // @ts-ignore
        if (!tag) return message.channel.error("You cant edit a tag that doesnt exists");

        const embed = new MessageEmbed()
            .setColor("BLUE")
            .setTitle(`Editing tag \`${tagName}\``)
            .setDescription(
                "Initiated process of editing a tag, you will have 2 minutes to respond with the new content",
            );

        const filter = (msg: Message) => msg.author === message.author;
        const collector = message.channel.createMessageCollector(filter, { time: 3 * 60 * 1000, max: 1 });

        const msg = await message.channel.send(embed);

        collector.on("end", (collected, reason) => {
            const content = collected.first()?.content;
            if (!content) {
                embed
                    .setColor("RED")
                    .setTitle(`Failed to edit tag \`${tagName}\``)
                    .setDescription("No valid content provided");

                msg.edit(embed);
            }

            const tags = guild.getTags;

            tags.set(tagName, content!);

            guild
                .setTags(tags)
                .then(() => {
                    embed
                        .setColor("GREEN")
                        .setTitle(`Edited tag \`${tagName}\``)
                        .setDescription(`Successfully edited \`${tagName}\` with the provided content`);

                    msg.edit(embed);
                })
                .catch((err) => {
                    embed
                        .setColor("RED")
                        .setTitle(`Failed to edit \`${tagName}\``)
                        .setDescription(
                            `Something went wrong while editing \`${tagName}\` tag, please try again later`,
                        );

                    msg.edit(embed);
                    this.handler.logger.error(err);
                });
        });
    }

    private async deleteTag(tagName: string, guild: GuildDB, message: Message) {
        const tag = this.getTag(tagName, guild);
        // @ts-ignore
        if (!tag) return message.channel.error("You cant delete a tag that doesnt exists");

        const embed = new MessageEmbed()
            .setColor("YELLOW")
            .setTitle(`Deleting \`${tagName}\` tag`)
            .setDescription(`Are you sure you want to delete the \`${tagName}\` tag`);

        const msg = await message.channel.send(embed);

        await msg.react("❌");
        await msg.react("✅");

        const filter = (reaction: MessageReaction, user: User) =>
            user.id === message.author.id && (reaction.emoji.name === "✅" || reaction.emoji.name === "❌");
        const reactionCollector = msg.createReactionCollector(filter, { max: 1, time: 60000 });

        reactionCollector.on("end", (collected, reason) => {
            const emoji = collected.first()?.emoji;

            if (emoji?.name === "❌") {
                embed
                    .setColor("RED")
                    .setTitle("Deletion aborted")
                    .setDescription(`Deletion of \`${tagName}\` successfully aborted`);

                msg.edit(embed);
            }

            if (emoji?.name === "✅") {
                const tags = guild.getTags;

                tags.delete(tagName);

                guild
                    .setTags(tags)
                    .then(() => {
                        embed
                            .setColor("GREEN")
                            .setTitle(`Deleted \`${tagName}\` tag`)
                            .setDescription(`Successfully deleted \`${tagName}\` tag`);

                        msg.edit(embed);
                    })
                    .catch((err) => {
                        embed
                            .setColor("RED")
                            .setTitle(`Aborted deletion of \`${tagName}\` tag`)
                            .setDescription(
                                `Something went wrong while deleting \`${tagName}\` tag, please try again later`,
                            );

                        msg.edit(embed);
                        this.handler.logger.error(err);
                    });
            }
        });
    }
};
