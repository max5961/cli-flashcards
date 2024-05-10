var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React from "react";
import { render } from "ink";
import App from "./App.js";
import { Args } from "./shared/utils/ProcessArguments.js";
import { execFileSync } from "child_process";
function executeBeforeExit(command) {
    process.on("beforeExit", (code) => {
        console.log(`Running Command: ${command}`);
        const fullCommand = command.split(" ");
        const executable = fullCommand[0];
        const args = fullCommand.slice(1);
        const stdout = execFileSync(executable, args, {
            encoding: "utf-8",
        });
        console.log(stdout);
    });
}
function entryPoint() {
    return __awaiter(this, void 0, void 0, function* () {
        const args = new Args();
        yield args.processSelection();
        yield args.executeUtilityFlags();
        args.setConfigFromArgv();
        const config = args.getConfig();
        const initialQuestions = args.getInitialQuestions();
        if (config.postCommand !== null) {
            executeBeforeExit(config.postCommand);
        }
        render(React.createElement(App, { initialQuestions: initialQuestions, config: config }));
    });
}
entryPoint();
//# sourceMappingURL=root.js.map