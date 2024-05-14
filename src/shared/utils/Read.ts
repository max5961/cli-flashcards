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
            const json = await fs.readFile(filePath, "utf-8");
            const quiz = JSON.parse(json);
            quiz.fileName = file;
            quizzes.push(quiz);
        }

        return quizzes;
    }

    static async getDataFromFile(filePath: string): Promise<string> {
        return fs
            .readFile(filePath, "utf-8")
            .catch((err) => {
                const dir = Read.getDir();
                const joinedFilePath = path.join(dir, filePath);
                return fs.readFile(joinedFilePath, "utf-8");
            })
            .catch((err) => {
                console.log(`file '${filePath}' does not exist`);
                process.exit();
            });
    }

    static validateQuizObject(quiz: Quiz): void {
        if (!quiz.sections) {
            throw new Error("JSON Object must include a sections array");
        }

        if (!Array.isArray(quiz.sections)) {
            throw new Error("sections property must be an array");
        }

        for (const section of quiz.sections) {
            if (!section.name) {
                throw new Error("Missing section name");
            }

            if (!section.questions) {
                throw new Error("Missing questions array in section");
            }

            if (!Array.isArray(section.questions)) {
                throw new Error("questions property must be an array");
            }

            for (const question of section.questions) {
                if (
                    question.type !== "qa" &&
                    question.type !== "qi" &&
                    question.type !== "mc"
                ) {
                    throw new Error(
                        "type property must be either 'qa', 'qi', or 'mc'",
                    );
                }

                if (!question.q || !question.a) {
                    throw new Error("Missing q and a properties");
                }

                if (question.type === "mc") {
                    if (!question.choices) {
                        throw new Error("Missing choices array");
                    }

                    if (!Array.isArray(question.choices)) {
                        throw new Error("choices property must be an array");
                    }

                    if (question.choices.length > 4) {
                        throw new Error(
                            "choices array exceeds maximum length of 4",
                        );
                    }

                    if (
                        question.a.toUpperCase() !== "A" &&
                        question.a.toUpperCase() !== "B" &&
                        question.a.toUpperCase() !== "C" &&
                        question.a.toUpperCase() !== "D"
                    ) {
                        throw new Error(
                            "Invalid answer for multiple choice.  (should be either 'A', 'B', 'C', or 'D')",
                        );
                    }
                }
            }
        }
    }
}
