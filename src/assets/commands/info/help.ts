import Command from "../../../handlers/Command";
import Handler from "../../../handlers/Handler";
import { stripIndents } from "common-tags";
import { IArgs } from "../../../Utils";
import { Message, MessageEmbed } from "discord.js";

module.exports = class extends Command {
    public handler: Handler;

    constructor({ handler }: IArgs) {
        super('help', {
            aliases: ['info', 'h'],
            category: 'info',
            description: 'Send the commands or info about a command',
            usage: '[command]',
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[]) {
        const commandName: string | undefined = args[0];

        if (!commandName) return message.channel.send(this.getAll());

        const command: Command | undefined = this.handler.commands.get(args[0]) || this.handler.aliases.get(args[0]);

        if (!command) return message.channel.send(`No info found about \`${commandName}\``);

        message.channel.send(this.getCmd(command));
    }

    private getCmd(command: Command): MessageEmbed {

        const aliases: string | undefined = command.aliases?.map(alias => `\`${alias}\``).join(' ') || '__';

        const embed: MessageEmbed = new MessageEmbed()
            .setColor('GREEN')
            .setTitle('Command')
            .setDescription(stripIndents`
            **Name:** ${command.name}
            **Aliases:** ${aliases}
            **Description:** ${command.description}
            **Usage:** ${command.usage}
            **Is enabled:** ${command.enabled}
        `)
            .setFooter('Syntax: <> = required, [] = optional');

        return embed;
    }

    private getAll(): MessageEmbed {
        const commands = (category: string): string => {
            return this.handler.commands
                .filter(cmd => cmd.category === category && cmd.category !== 'debug')
                .filter(cmd => cmd.enabled === true)
                .map(cmd => `- \`${cmd.name}\``)
                .join('\n');
        }

        const info = this.handler.categories
            .map(category => stripIndents`**${category.charAt(0).toLocaleUpperCase() + category.slice(1)}**\n${commands(category)}`)
            .join('\n')

        const embed: MessageEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle('Commands')
            .setDescription(info);

        return embed;
    }
}