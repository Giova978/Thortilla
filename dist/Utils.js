"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class Utils {
    static readdirSyncRecursive(directory) {
        let files = [];
        fs.readdirSync(directory).forEach(file => {
            const fileLocation = path.join(directory, file);
            if (fs.lstatSync(fileLocation).isDirectory()) {
                files = [...files, ...Utils.readdirSyncRecursive(fileLocation)];
            }
            else {
                files.push(fileLocation);
            }
        });
        return files;
    }
    static getMember(message, toFind = '') {
        var _a, _b;
        toFind = toFind.toLowerCase();
        let target = (_a = message.guild) === null || _a === void 0 ? void 0 : _a.members.cache.get(toFind);
        if (!target && message.mentions.members)
            target = message.mentions.members.first();
        if (!target && toFind) {
            target = (_b = message.guild) === null || _b === void 0 ? void 0 : _b.members.cache.find(member => {
                return member.displayName.toLowerCase().includes(toFind) ||
                    member.user.tag.toLowerCase().includes(toFind);
            });
        }
        if (!target)
            target = undefined;
        return target;
    }
    static formatDate(date) {
        if (date === undefined || date === null)
            return undefined;
        return new Intl.DateTimeFormat('es-ES', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' }).format(date);
    }
    static formatTimestamp(timestamp) {
        if (timestamp === undefined || timestamp === null)
            return undefined;
        let date = new Date(timestamp);
        let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let day = days[date.getDay()];
        let monthDay = date.getDate() > 10 ? date.getDate() : `0${date.getDate()}`;
        let month = date.getMonth();
        month = month >= 10 ? month : `0${month}`;
        let year = date.getFullYear();
        let dateFormated = `${day}, ${monthDay}/${month}/${year}`;
        return dateFormated;
    }
    static deleteMessage(message, time = 5000) {
        if (Array.isArray(message)) {
            for (const msg of message) {
                msg.delete({ timeout: time });
            }
            return;
        }
        message.delete({ timeout: time });
    }
}
exports.Utils = Utils;
