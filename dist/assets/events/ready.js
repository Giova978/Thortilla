"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = __importDefault(require("../../handlers/Event"));
module.exports = class extends Event_1.default {
    constructor({ client, handler }) {
        super("ready", "required");
        this.client = client;
        this.handler = handler;
    }
    run() {
        var _a;
        (_a = this.client.user) === null || _a === void 0 ? void 0 : _a.setPresence({
            activity: {
                name: "A TI! 😈",
                type: "WATCHING",
            },
        });
        console.log(`Bot Online`);
        // this.handler.lavaClient = new LavaClient(
        //     this.client,
        //     // @ts-ignore
        //     this.handler.nodes
        // );
        // this.handler.player = new Player(this.handler.lavaClient, this.handler);
    }
};
