import { Quiz } from "../../types.js";
import path from "path";
import os from "os";
import fs from "fs/promises";

export default class Read {
    static async makeDir(): Promise<void> {
        const shareDir: string = path.join(os.homedir(), ".local", "share");
        const directories: string[] = await fs.readdir(shareDir);
        if (directories.includes("quild")) {
            return;
        }

        const newDir = path.join(shareDir, "quild");
        await fs.mkdir(newDir, { recursive: true });
    }

    static getDir(): string {
        return path.join(os.homedir(), ".local", "share", "quild");
    }

    // need to pass in 'exit' function from useApp hook because if any error occurs
    // here, process.exit will not gaurantee that stdout is not obscured by the running
    // app, leaving no clues as to why something crashed.  ProcessArgs cannot access
    // the useApp hook so 'exit' param defaults to null
    static handleExit(
        exit: (() => void) | null,
        msg: string | null = null,
    ): void {
        if (exit) {
            exit();
            msg && console.error(msg);
        } else {
            msg && console.error(msg);
            process.exit(1);
        }
    }

    static async getData(exit: (() => void) | null = null): Promise<Quiz[]> {
        const dir: string = Read.getDir();
        const files: string[] = await fs.readdir(dir);
        const quizzes: Quiz[] = [];

        for (const file of files) {
            try {
                const filePath = path.join(dir, file);
                const stat = await fs.stat(filePath);
                if (stat.isDirectory() || file === ".git") continue;

                const json = await fs.readFile(filePath, "utf-8");
                if (!json.length) {
                    console.error(`Error: File '${file}' is empty`);
                    Read.handleExit(exit, `Error: File '${file}' is empty`);
                }

                const quiz = JSON.parse(json);
                quiz.fileName = file;
                quizzes.push(quiz);
                Read.validateData(quiz);
            } catch (err: any) {
                Read.handleExit(exit, err.message);
            }
        }

        return quizzes;
    }

    static async getDataFromFile(
        filePath: string,
        exit: (() => void) | null = null,
    ): Promise<string> {
        if (!path.isAbsolute(filePath)) {
            filePath = path.join(Read.getDir(), filePath);
        }

        try {
            const json = await fs.readFile(filePath, "utf-8");
            if (Read.validateData(JSON.parse(json))) {
                return json;
            }
        } catch (err: any) {
            Read.handleExit(exit, err.msg);
        }

        throw new Error(`${filePath}: Unhandled error`);
    }

    // prettier-ignore
    static validateData(quiz: any): boolean {
        const exitWithErr = (msg: string) => {
            throw new Error(`
                            ${JSON.stringify(quiz)}
                            ${msg}
                            `)
        };

        const logWarning = (msg: string, obj: Object) => {
            console.log("WARNING: ");
            console.log(msg);
            console.log(obj);
        }

        // check for presence and correct type, allow empty strings as property names
        const valid = (property: any, type: string) => {
            if (type === "array") {
                return property && Array.isArray(property);
            }
            return (property === "" || property) && typeof property === type;
        }

        if (!valid(quiz.fileName, "string")) exitWithErr("Missing or invalid 'fileName' property");
        if (!valid(quiz.sections, "array")) exitWithErr("Missing or invalid 'sections' array");

        for (const section of quiz.sections) {
            if (!valid(section.name, "string")) exitWithErr("Missing or invalid section 'name' property");
            if (!valid(section.questions, "array")) exitWithErr(`Missing or invalid 'questions' array in ${section.name}`);

            for (const question of section.questions) {
                if (!valid(question.type, "string")) exitWithErr("Missing or invalid Question 'type' property")

                if ( question.type !== "mc" && question.type !== "qa" && question.type !== "qi") {
                    exitWithErr(`Question has invalid type.  Must be 'mc' | 'qa' | 'qi'`);
                }

                if (!valid(question.q, "string")) exitWithErr("Missing or invalid Question 'q' property");
                if (!valid(question.a, "string")) exitWithErr("Missing or invalid Question 'a' property");

                if (question.type !== "mc" && question.choices) {
                    exitWithErr("Question 'choices' array can only exist on multiple choice questions");
                } 

                if (question.type === "mc") {
                    if (!valid(question.choices, "array")) exitWithErr("Missing or invalid Question 'choices' array");
                    if (question.choices.length > 4) exitWithErr("Question 'choices' array cannot exceed 4 options");

                    for (const choice of question.choices) {
                        if (typeof choice !== "string") exitWithErr("Each question in the Question 'choices' array must be of type 'string'")
                    }

                    // check if valid answer exists
                    let isValid = false;
                    for (let i = 0; i < question.choices.length; ++i) {
                        if (question.a.toUpperCase() === String.fromCharCode(65 + i)) {
                            isValid = true;
                        }
                    }
                    if (!isValid) {
                        logWarning("Invalid Multiple Choice answer or choices.", question);
                    }
                }
            }
        }

        return true;
    }
}
