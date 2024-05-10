import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import Read from "./Read.js";
import { Quiz, Question } from "../../types.js";

export interface Config {
    postCommand: null | "string";
    fullscreen: boolean;
    random: boolean;
}

interface KB {
    [key: string]: string;
}

export class Args {
    private argv!: any;
    private config!: Config;
    private keyBinds!: KB;
    private questions: Question[];
    private quizzes: Quiz[];

    constructor() {
        this.setArgv();
        this.setDefaultConfig();
        this.setKeyBinds();
        this.questions = [];
        this.quizzes = [];
    }

    setArgv(): any {
        this.argv = yargs(hideBin(process.argv))
            // selection
            .option("section", {
                describe:
                    "Choose section(s). 'all' for all sections in a given file(s)",
                type: "array",
                implies: ["file"], // require to be used with 'section' flag
                requiresArg: true,
            })
            .option("file", {
                describe: "Choose file(s) / quiz name(s).  'all' for all files",
                type: "array",
                implies: ["section"],
                requiresArg: true,
            })

            // utility
            .options("keybinds", {
                describe: "List keybinds",
                type: "boolean",
                default: false,
            })
            .options("list-files", {
                describe: "Show all files",
                type: "boolean",
                requiresArg: false,
            })
            .options("list-sections", {
                describe:
                    "List all available sections from one or more files.  Pass in 'all' to pass in all files as an argument",
                type: "array",
                requiresArg: true,
            })

            // configuration
            .option("random", {
                describe: "Questions will be in asked in random order",
                type: "boolean",
                default: false,
            })
            .option("fullscreen", {
                describe: "Application runs using entire terminal screen",
                type: "boolean",
                default: true,
            })
            .options("post-command", {
                describe: "A command to be ran post exiting the application",
                type: "string",
                requiresArg: true,
            })
            .parse();
    }

    setKeyBinds(): void {
        this.keyBinds = {
            up: "up-arrow | k",
            down: "down-arrow | j",
            left: "left-arrow | h",
            right: "right-arrow | l",
            "enter insert": "i",
            clear: "cc",
            "delete list item": "dd",
        };
    }

    setDefaultConfig(): void {
        this.config = {
            postCommand: null,
            fullscreen: true,
            random: false,
        };
    }

    setConfigFromArgv(): void {
        if (this.argv.postCommand) {
            this.config.postCommand = this.argv.postCommand;
        } else {
            this.config.postCommand = null;
        }

        this.config.random = this.argv.random;
        this.config.fullscreen = this.argv.fullscreen;
    }

    getKeyBinds(): KB {
        return this.keyBinds;
    }

    getConfig(): Readonly<Config> {
        return this.config;
    }

    // If no selection is passed to the cli, return null
    // If selection generates an empty result, it will throw an error during
    // the selection process
    getInitialQuestions(): Question[] | null {
        if (this.questions.length === 0) return null;
        return this.questions;
    }

    async handleListSections(arg: string[]): Promise<void> {
        const quizzes: Quiz[] = [];
        if (arg.includes("all")) {
            arg.splice(arg.indexOf("all"), 1);
            quizzes.push(...(await Read.getData()));
        }

        for (const file of arg) {
            const json: string = await Read.getDataFromFile(file);
            const fileData: Quiz = JSON.parse(json) as Quiz;
            fileData.fileName = file;
            quizzes.push(fileData);
        }

        for (const quiz of quizzes) {
            let result: string = `File: ${quiz.fileName}`;
            for (const section of quiz.sections) {
                result += `\n  ${section.name}`;
            }
            console.log(result);
        }
    }

    async handleListFiles(): Promise<void> {
        const quizzes: Quiz[] = await Read.getData();
        let result: string = "";
        quizzes.forEach((quiz) => {
            result += `${quiz.fileName} `;
        });
        console.log(result);
    }

    handleListKeyBinds(): void {
        for (const key in this.keyBinds) {
            console.log(`${key}: ${this.keyBinds[key]}`);
            console.log();
        }
    }

    async executeUtilityFlags(): Promise<void> {
        const listFiles: boolean = this.argv.listFiles;
        const listSections: boolean = this.argv.listSections !== undefined;
        const keyBinds: boolean = this.argv.keybinds;

        // show keybinds
        if (keyBinds) {
            this.handleListKeyBinds();
            process.exit();
        }

        if (listFiles) {
            await this.handleListFiles();
            process.exit();
        }

        if (listSections) {
            await this.handleListSections(this.argv.listSections);
            process.exit();
        }
    }

    async processSelection(): Promise<void> {
        if (!this.argv.file || !this.argv.section) return;

        if (this.argv.file.includes("all")) {
            await this.pushAllQuizzes();
        } else if (this.argv.file) {
            await this.pushSelectedQuizzes();
        }

        if (this.argv.section.includes("all")) {
            this.pushAllSections();
        } else {
            this.pushSelectedSections();
        }

        if (this.questions.length === 0) {
            console.error("No questions in current selection");
            process.exit();
        }
    }

    async pushAllQuizzes(): Promise<void> {
        this.quizzes.push(...(await Read.getData()));
    }

    async pushSelectedQuizzes(): Promise<void> {
        for (const file of this.argv.file) {
            const json: string = await Read.getDataFromFile(file);
            const quiz: Quiz = JSON.parse(json) as Quiz;
            quiz.fileName = file;
            this.quizzes.push(quiz);
        }
    }

    async pushAllSections(): Promise<void> {
        this.questions.push(
            ...this.quizzes.flatMap((quiz) => {
                return quiz.sections.flatMap((section) => {
                    return section.questions.map((question) => question);
                });
            }),
        );
    }

    async pushSelectedSections(): Promise<void> {
        for (const argvSection of this.argv.section) {
            const filteredQuestions = this.quizzes.flatMap((quiz) => {
                return quiz.sections
                    .filter((section) => section.name === argvSection)
                    .flatMap((section) => section.questions);
            });

            if (filteredQuestions.length) {
                this.questions.push(...filteredQuestions);
            } else {
                throw new Error(
                    `Section: '${argvSection}' does not belong to any quizzes passed as arguments`,
                );
            }
        }
    }
}
