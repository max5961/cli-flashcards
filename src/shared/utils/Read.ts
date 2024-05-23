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

    static async getData(): Promise<Quiz[]> {
        const dir: string = Read.getDir();
        const files: string[] = await fs.readdir(dir);
        const quizzes: Quiz[] = [];

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);
            if (stat.isDirectory() || file === ".git") continue;

            const json = await fs.readFile(filePath, "utf-8");
            if (!json.length) {
                console.error(`Error: File '${file}' is empty`);
                process.exit(1);
            }

            const quiz = JSON.parse(json);
            quiz.fileName = file;
            quizzes.push(quiz);
            Read.validateData(quiz);
        }

        return quizzes;
    }

    static async getDataFromFile(filePath: string): Promise<string> {
        if (!path.isAbsolute(filePath)) {
            filePath = path.join(Read.getDir(), filePath);
        }

        const json = await fs.readFile(filePath, "utf-8");
        if (Read.validateData(JSON.parse(json))) {
            return json;
        }

        throw new Error(`${filePath}: Unhandled error`);
    }

    // prettier-ignore
    static validateData(quiz: any): boolean {
        const logExit = (msg: string) => {
            console.log(JSON.stringify(quiz));
            console.error(msg);
            process.exit(1);
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

        if (!valid(quiz.fileName, "string")) logExit("Missing or invalid 'fileName' property");
        if (!valid(quiz.sections, "array")) logExit("Missing or invalid 'sections' array");

        for (const section of quiz.sections) {
            if (!valid(section.name, "string")) logExit("Missing or invalid section 'name' property");
            if (!valid(section.questions, "array")) logExit(`Missing or invalid 'questions' array in ${section.name}`);

            for (const question of section.questions) {
                if (!valid(question.type, "string")) logExit("Missing or invalid Question 'type' property")

                if ( question.type !== "mc" && question.type !== "qa" && question.type !== "qi") {
                    logExit(`Question has invalid type.  Must be 'mc' | 'qa' | 'qi'`);
                }

                if (!valid(question.q, "string")) logExit("Missing or invalid Question 'q' property");
                if (!valid(question.a, "string")) logExit("Missing or invalid Question 'a' property");

                if (question.type !== "mc" && question.choices) {
                    logExit("Question 'choices' array can only exist on multiple choice questions");
                } 

                if (question.type === "mc") {
                    if (!valid(question.choices, "array")) logExit("Missing or invalid Question 'choices' array");
                    if (question.choices.length > 4) logExit("Question 'choices' array cannot exceed 4 options");

                    for (const choice of question.choices) {
                        if (typeof choice !== "string") logExit("Each question in the Question 'choices' array must be of type 'string'")
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
