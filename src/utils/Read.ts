import { Quiz } from "../types.js";
import path from "path";
import os from "os";
import fs from "fs";

export default class Read {
    static getData(): Quiz[] {
        const dir: string = path.join(
            os.homedir(),
            ".local",
            "share",
            "flashcards",
        );
        const files: string[] = fs.readdirSync(dir);

        const quizzes: Quiz[] = [];

        for (const file of files) {
            const filePath = path.join(dir, file);
            const json = fs.readFileSync(filePath, "utf-8");
            const quiz = JSON.parse(json);
            quiz.fileName = file;
            quizzes.push(quiz);
        }

        return quizzes;
    }

    static validateQuizObject(quiz: Quiz): boolean {
        if (!quiz.sections) {
            console.log("JSON object must include 'sections' array.");
            return false;
        }

        for (const section of quiz.sections) {
            if (!section.name || !section.questions) {
                console.log("2");
                return false;
            }

            for (const question of section.questions) {
                if (
                    question.type !== "qa" &&
                    question.type !== "mc" &&
                    question.type !== "qi"
                ) {
                    return false;
                }

                if (question.type === "qa" || question.type === "qi") {
                    if (!question.q || !question.a) {
                        return false;
                    }
                }

                if (question.type === "mc") {
                    if (!question.q || !question.a || !question.choices) {
                        return false;
                    }

                    if (!Array.isArray(question.choices)) {
                        return false;
                    }

                    let hasValidAnswer: boolean = false;
                    for (const obj of question.choices) {
                        for (const key in obj) {
                            if (typeof key !== "string") {
                                return false;
                            }

                            if (typeof obj[key] !== "string") {
                                return false;
                            }
                            if (key === question.a) {
                                hasValidAnswer = true;
                            }
                        }
                    }

                    if (!hasValidAnswer) {
                        return false;
                    }
                }
            }
        }

        return true;
    }
}
