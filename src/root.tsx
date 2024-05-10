import React from "react";
import { render } from "ink";
import App from "./App.js";
import { Args, Config } from "./shared/utils/ProcessArguments.js";
import { Question } from "./types.js";
import { execFileSync } from "child_process";

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
    const args: Args = new Args();

    await args.processSelection();
    await args.executeUtilityFlags();
    args.setConfigFromArgv();
    const config: Readonly<Config> = args.getConfig();
    const initialQuestions: Question[] | null = args.getInitialQuestions();

    if (config.postCommand !== null) {
        executeBeforeExit(config.postCommand);
    }

    render(<App initialQuestions={initialQuestions} config={config} />);
}

entryPoint();
