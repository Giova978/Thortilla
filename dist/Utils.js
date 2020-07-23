"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
