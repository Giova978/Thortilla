import { IArgs } from "../../Utils";
import Event from "../../handlers/Event";
import Handler from "../../handlers/Handler";
import ascii from "ascii-table";

module.exports = class extends Event {
    public handler: Handler;
    private Commands = new ascii("Commands");
    private Events = new ascii("Events");

    constructor({ handler }: IArgs) {
        super("ready", "required");

        this.handler = handler;
        this.Commands.setHeading("Command", "Status", "Enabled");
        this.Events.setHeading("Event", "Status", "Enabled");
    }

    public async run() {
        this.handler.commands.map((command) => {
            this.Commands.addRow(command.name, "Loaded", command.enabled);
        });

        this.handler.events.map((events, eventName) => {
            this.Events.addRow(eventName, "Loaded", events[0].enabled);
        });

        console.log(this.Commands.toString());
        console.log(this.Events.toString());
    }
};
