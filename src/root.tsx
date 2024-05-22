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

    const args: ProcessArgs = new ProcessArgs();

    await args.utilityArgs.processUtilityFlags();
    const config: Readonly<Config> = args.configArgs.processConfigFlags();
    const initialQuestions = await args.selectionArgs.processSelectionFlags();

    // processSelectionFlags checks selected files but does not check all files
    // Could also not include this.  If you enter the app with no selection
    // it will already check all files anyways.  If you enter the app with a selection
    // and the entire selection is okay, then everything will work good until
    // you try to enter SelectionMode or EditMode
    // if (!initialQuestions) {
    //     await Read.getData();
    // }

    if (config.postCommand !== null) {
        executeBeforeExit(config.postCommand);
    }

    render(<App initialQuestions={initialQuestions} config={config} />);
}

entryPoint();
