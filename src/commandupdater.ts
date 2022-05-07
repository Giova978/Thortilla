import Handler from "@handlers/Handler";
import { execSync } from "child_process";
import { watch } from "chokidar";

export default function (handler: Handler) {
    const watcher = watch(`${__dirname}/../src/features`);

    watcher.on("change", (path, stats) => {
        console.log(`File ${path} changed, reloading...`);

        try {
            execSync(`npm run tsc`);
            const distPath = path.replace("src", "dist").replace("ts", "js");

            // Delete the cached required file
            delete require.cache[require.resolve(distPath)];

            const command = new (require(distPath))({ client: handler.client, handler });
            handler.reloadCommand(command);
            console.log(`Reloaded ${command.name}`);
        } catch (error) {
            console.log("An error happened while reloading a command", error);
        }
    });
}
