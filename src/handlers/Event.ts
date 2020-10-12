import Toogleable from "./Toggleable";
import { IEvent } from "../Utils";
import { ClientEvents } from "discord.js";

export default class Event extends Toogleable implements IEvent {
    public eventName: keyof ClientEvents;
    public category: string;

    constructor(eventName: keyof ClientEvents, category: string) {
        super();

        this.eventName = eventName;
        this.category = category;
    }

    public async run(...args: any): Promise<any> {
        throw new Error(`${this.eventName} doesnt have any run method`);
    }
}
