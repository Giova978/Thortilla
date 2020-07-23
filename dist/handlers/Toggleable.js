"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Toogleable {
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
exports.default = Toogleable;
