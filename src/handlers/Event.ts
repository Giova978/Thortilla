import Toogleable from "./Toggleable";
import { IEvent } from "../Utils";

export default class Event extends Toogleable implements IEvent {
    public eventName: string;
    public category: string;

    constructor(eventName: string, category: string) {
        super();

        this.eventName = eventName;
        this.category = category;
    }

    public run(...args: any) {
        throw new Error(`${this.eventName} doesnt have any run method`);
    }
}
