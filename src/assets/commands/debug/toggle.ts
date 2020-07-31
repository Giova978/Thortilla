import Command from "../../../handlers/Command";
import Handler from "../../../handlers/Handler";
import { IArgs, Utils } from "../../../Utils";
import { Message } from "discord.js";
import Event from "../../../handlers/Event";

module.exports = class extends Command {
    public handler: Handler;

    constructor({ handler }: IArgs) {
        super("toggle", {
            aliases: ["tg"],
            description: "Toggle the provided command",
            category: "debug",
            usage: "<Name or Alias> [command, feature or event] Default: command",
        });

        this.handler = handler;
    }

    public async run(message: Message, args: string[]) {
        if (message.author.id !== process.env.OWNER) return message.channel.send("Command only for debug").then((msg) => Utils.deleteMessage(msg, 1000));

        // The name of the command, event or feature
        const name: string | undefined = args[0];

        if (!name) return message.channel.send("Please give me a command, feature or event to toggle").then(Utils.deleteMessage);

        // The type (command, event or feature)
        const type: string | undefined = args[1];

        // Enabled / Disabled variable in string
        let stateInString: string;

        // Toggle the specified type command, event or feature
        // If isn't specified then toggle a command
        switch (type) {
            case "event":
                const events: Event[] | undefined = this.handler.events.get(name);
                if (!events) return message.channel.send("I can't found the events");

                events.map((event: Event) => {
                    event.toogle();
                });

                stateInString = events[0].enabled ? "`enabled`" : "`disabled`";

                message.channel.send(`Events \`${name}\` are now ${stateInString}`);
                break;

            default:
                // Toggle a command
                const command: Command | undefined = this.handler.commands.get(name) || this.handler.aliases.get(name);

                if (!command) return message.channel.send("I can't found the command");

                command.toogle();

                stateInString = command.enabled ? "`enabled`" : "`disabled`";

                message.channel.send(`Command \`${name}\` is now ${stateInString}`);
                break;
        }
    }
};
