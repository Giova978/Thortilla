import Toogleable from "./Toggleable";
import { IEvent } from "../Utils";

export default class Event extends Toogleable implements IEvent {
    public eventName: string;

    constructor(eventName: string) {
        super();
        
        this.eventName = eventName;
    }

    public run(...args: any) {
        throw new Error(`${this.eventName} doesnt have any run method`);
    }
}