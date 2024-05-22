import React from "react";
import { render } from "ink";
import App from "./App.js";
import { ProcessArgs, Config } from "./shared/utils/ProcessArgs.js";
import { execFileSync } from "child_process";
import Read from "./shared/utils/Read.js";

function executeBeforeExit(command: string): void {
    process.on("beforeExit", (code) => {
        console.log(`Running Command: ${command}`);
        const fullCommand: string[] = command.split(" ");
        const executable: string = fullCommand[0];
        const args: string[] = fullCommand.slice(1);
        const stdout: string = execFileSync(executable, args, {
            encoding: "utf-8",
        });
        console.log(stdout);
    });
}

async function entryPoint() {
    await Read.makeDir(); // make sure directory in .local/share exists
    await Read.getData(); // initial check for error-free json data

    const args: ProcessArgs = new ProcessArgs();

    await args.utilityArgs.processUtilityFlags();
    const config: Readonly<Config> = args.configArgs.processConfigFlags();
    const initialQuestions = await args.selectionArgs.processSelectionFlags();

    if (config.postCommand !== null) {
        executeBeforeExit(config.postCommand);
    }

    render(<App initialQuestions={initialQuestions} config={config} />);
}

entryPoint();
