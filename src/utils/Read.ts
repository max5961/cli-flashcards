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
                        question.a !== "A" &&
                        question.a !== "B" &&
                        question.a !== "C" &&
                        question.a !== "D"
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
