import { IToogle } from "../Utils";

export default class Toogleable implements IToogle {
    public enabled: boolean;

    constructor() {
        this.enabled = true;
    }

    toogle() {
        this.enabled = !this.enabled;
    }

    enable() {
        this.enabled = true;
    }

    disbale() {
        this.enabled = false;
    }
}