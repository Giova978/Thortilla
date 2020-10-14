import { IToggle } from "../Utils";

export default class Toggleable implements IToggle {
    public enabled: boolean;

    constructor() {
        this.enabled = true;
    }

    toggle() {
        this.enabled = !this.enabled;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
}
