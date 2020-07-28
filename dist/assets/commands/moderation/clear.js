"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../../handlers/Command"));
const Utils_1 = require("../../../Utils");
module.exports = class extends Command_1.default {
    constructor() {
        super("clear", {
            permissions: ["MANAGE_MESSAGES"],
            category: "moderation",
            description: "Clear messages or search x messages for the author given and delete them",
            usage: "<amount> [user]",
        });
    }
    run(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const toDelete = +args[0];
            if (!toDelete)
                return message.channel.send("Provide a valid number to delete");
            if (toDelete < 1 || toDelete > 100)
                return message.channel.send("Provide a number between 1 and 100");
            message.delete();
            const user = Utils_1.Utils.getMember(message, args[1]);
            if (user) {
                const messages = yield message.channel.messages
                    .fetch({
                    limit: toDelete,
                })
                    .then((messages) => messages.filter((msg) => msg.author.id === user.id));
                if (messages.size < 1)
                    return message.channel.send(`No messages found for \`${user.displayName}\``).then(Utils_1.Utils.deleteMessage);
                return message.channel
                    .bulkDelete(messages, true)
                    .then((messagesDeleted) => {
                    message.channel.send(`Successfully deleted \`${messagesDeleted.size}\` messages from \`${user.displayName}\``).then(Utils_1.Utils.deleteMessage);
                })
                    .catch((err) => {
                    console.error(err);
                    message.channel.send("Try again later").then(Utils_1.Utils.deleteMessage);
                });
            }
            message.channel
                .bulkDelete(toDelete, true)
                .then((messagesDeleted) => {
                message.channel.send(`Successfully deleted \`${messagesDeleted.size}\` messages`).then(Utils_1.Utils.deleteMessage);
            })
                .catch((err) => {
                console.error(err);
                message.channel.send("Try again later").then(Utils_1.Utils.deleteMessage);
            });
        });
    }
};
