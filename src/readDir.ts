import { readdirSync, readFileSync } from "fs";
import os from "os";
import path from "path";
import { QuizData, QuizFileData } from "./interfaces.js";

export function getData(): QuizData {
    const dir: string = path.join(
        os.homedir(),
        ".local",
        "share",
        "flashcards",
    );
    const files: string[] = readdirSync(dir);

    const quizData: QuizData = { quizzes: [] };

    for (const file of files) {
        const filePath = path.join(dir, file);
        const json = readFileSync(filePath, "utf-8");
        const quizFileData: QuizFileData = JSON.parse(json);
        quizData.quizzes.push(quizFileData);
    }

    return quizData;
}
