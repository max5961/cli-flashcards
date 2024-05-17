import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import Read from "./Read.js";
import { Quiz, Question } from "../../types.js";

export class ProcessArgs {
    public selectionArgs: SelectionArgs;
    public configArgs: ConfigArgs;
    public utilityArgs: UtilityArgs;

    constructor() {
        this.selectionArgs = new SelectionArgs();
        this.configArgs = new ConfigArgs();
        this.utilityArgs = new UtilityArgs();
    }
}

abstract class Args {
    protected argv!: any;

    constructor() {
        this.setArgv();
    }

    abstract setArgv(): void;

    async pushSelectedFiles(target: Quiz[], selected: string[]): Promise<void> {
        for (const file of selected) {
            const json: string = await Read.getDataFromFile(file);
            const fileData: Quiz = JSON.parse(json) as Quiz;
            fileData.fileName = file;
            target.push(fileData);
        }
    }

    exitOnSingleValueError(value: string, flag: string) {
        console.error(
            `The ${flag} flag cannot combine other values with '${value}'`,
        );
        process.exit(1);
    }

    exitWithErrorMessage(msg: string) {
        console.error(msg);
        process.exit(1);
    }
}

class SelectionArgs extends Args {
    private questions: Question[];
    private quizzes: Quiz[];

    constructor() {
        super();
        this.questions = [];
        this.quizzes = [];
    }

    setArgv(): void {
        this.argv = yargs(hideBin(process.argv))
            .option("file", {
                alias: ["f"],
                describe: "Choose file(s) / quiz name(s).  'all' for all files",
                type: "array",
                implies: ["section"], // require to be used with "section" flag
                requiresArg: true,
            })
            .option("section", {
                alias: ["s"],
                describe: `
                    Choose section(s).  
                        'all' for all sections in a given selection of files(s)
                        'random' for a random section in a given selection of files(s)
                `,
                type: "array",
                implies: ["file"],
                requiresArg: true,
            })
            .options("repeat", {
                describe: "Repeat a given selection of questions 'x' times",
                type: "number",
                implies: ["section", "file"],
                requiresArg: true,
            })
            .options("shuffle", {
                describe:
                    "Shuffles the order of a given selection of questions",
                type: "boolean",
                implies: ["section", "file"],
            })
            .parse();
    }

    // returning null tells the app to enter the StartMenu
    // returning Question[] tells the app to enter QuizMode right away
    async processSelectionFlags(): Promise<Question[] | null> {
        if (!this.argv.file || !this.argv.section) return null;

        // --file
        if (this.argv.file.includes("all")) {
            await this.pushAllQuizzes();
        } else if (this.argv.file) {
            await this.pushSelectedQuizzes();
        }

        // --section
        if (this.argv.section.includes("all")) {
            this.pushAllSections();
        } else if (this.argv.section.includes("random")) {
            this.pushRandomSection();
        } else {
            this.pushSelectedSections();
        }

        // --repeat
        if (this.argv.repeat && this.argv.repeat > 1) {
            if (this.questions.length <= 1) {
                // prettier-ignore
                this.exitWithErrorMessage("Cannot repeat a selection which has only 1 question");
            }

            const repeatedQuestions: Question[] = [];
            let i = this.argv.repeat;
            while (i > 0) {
                --i;
                repeatedQuestions.push(...this.questions);
            }
            this.questions = repeatedQuestions;
        }

        // --random
        if (this.argv.random) {
            this.pushRandomSection();
        }

        // --shuffle
        if (this.argv.shuffle) {
            this.shuffle(this.questions);
        }

        // Bad selection
        if (this.questions.length === 0) {
            this.exitWithErrorMessage("No questions in current selection");
        }

        return this.questions;
    }

    async pushAllQuizzes(): Promise<void> {
        if (this.argv.file.length > 1) {
            this.exitOnSingleValueError("all", "--file");
        }
        this.quizzes.push(...(await Read.getData()));
    }

    async pushSelectedQuizzes(): Promise<void> {
        await this.pushSelectedFiles(this.quizzes, this.argv.file);
    }

    pushAllSections(): void {
        if (this.argv.section.length > 1) {
            this.exitOnSingleValueError("all", "--section");
        }

        this.questions.push(
            ...this.quizzes.flatMap((quiz) => {
                return quiz.sections.flatMap((section) => {
                    return section.questions.map((question) => question);
                });
            }),
        );
    }

    pushSelectedSections(): void {
        for (const argvSection of this.argv.section) {
            const filteredQuestions = this.quizzes.flatMap((quiz) => {
                return quiz.sections
                    .filter((section) => section.name === argvSection)
                    .flatMap((section) => section.questions);
            });

            if (filteredQuestions.length) {
                this.questions.push(...filteredQuestions);
            } else {
                console.error(
                    `Section: ${argvSection} does not belong to any selected quizzes/files`,
                );
                process.exit(1);
            }
        }
    }

    pushRandomSection(): void {
        if (this.argv.section.length > 1) {
            this.exitOnSingleValueError("random", "--section");
        }

        const sections: Question[][] = this.quizzes.flatMap((quiz) => {
            return quiz.sections.map((section) => section.questions);
        });

        const random = () => Math.floor(Math.random() * sections.length);
        this.questions.push(...sections[random()]);
    }

    shuffle(questions: Question[], cycles: number = 0): void {
        if (cycles >= 50) return;

        const getRandom = (s: number, e: number) => {
            return s + Math.floor(Math.random() * (e - s));
        };

        let s = 0;
        while (s < questions.length) {
            const randomIndex: number = getRandom(s, questions.length);
            const tmpEnd: Question = questions[questions.length - 1];

            // prevents duplicates being placed next to each other
            if (questions[questions.length - 2] === questions[randomIndex]) {
                continue;
            }

            if (
                // prettier-ignore
                questions[randomIndex - 1] === questions[questions.length - 1] ||
                questions[randomIndex + 1] === questions[questions.length - 1]
            ) {
                continue;
            }

            questions[questions.length - 1] = questions[randomIndex];
            questions[randomIndex] = tmpEnd;
            ++s;
        }

        this.shuffle(questions, ++cycles);
    }
}

class UtilityArgs extends Args {
    private keyBinds: string;

    constructor() {
        super();
        this.keyBinds = `<keybinds placeholder>`;
    }

    setArgv(): void {
        this.argv = yargs(hideBin(process.argv))
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
                    "List all available sections from one or more files.  Leave empty to pass in all files as an argument",
                type: "array",
            })
            .parse();
    }

    // execute any utility flags, then process.exit()
    async processUtilityFlags(): Promise<void> {
        const listFiles: boolean = this.argv.listFiles;
        const listSections: boolean = this.argv.listSections !== undefined;
        const keyBinds: boolean = this.argv.keybinds;

        if (keyBinds) {
            console.log(this.keyBinds);
        }

        if (listFiles) {
            await this.listFiles();
        }

        if (listSections) {
            await this.listSectionsInFiles();
        }

        if (keyBinds || listFiles || listSections) process.exit();
    }

    async listFiles(): Promise<void> {
        const quizzes: Quiz[] = await Read.getData();
        let result: string = "";
        quizzes.forEach((quiz) => {
            result += `${quiz.fileName} `;
        });
        console.log(result);
    }

    async listSectionsInFiles(): Promise<void> {
        const files: string[] = this.argv.listSections;

        const quizzes: Quiz[] = [];
        if (files.length === 0) {
            quizzes.push(...(await Read.getData()));
        } else {
            await this.pushSelectedFiles(quizzes, files);
        }

        for (const quiz of quizzes) {
            let result: string = `File: ${quiz.fileName}`;
            for (const section of quiz.sections) {
                result += `\n  ${section.name}`;
            }
            console.log(result);
        }
    }
}

export interface Config {
    postCommand: null | "string";
    fullscreen: boolean;
}

class ConfigArgs extends Args {
    private config: Config;

    constructor() {
        super();
        this.config = {
            postCommand: null,
            fullscreen: true,
        };
    }

    setArgv(): void {
        this.argv = yargs(hideBin(process.argv))
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

    processConfigFlags(): Config {
        this.config.postCommand = this.argv.postCommand
            ? this.argv.postCommand
            : null;

        this.config.fullscreen = this.argv.fullscreen;
        return this.config;
    }
}
