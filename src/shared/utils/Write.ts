import path from "path";
import fs from "fs/promises";
import { PageStack } from "./PageStack.js";
import { Quiz } from "../../types.js";
import Read from "./Read.js";

export class Write {
    static getDirectory(): string {
        return Read.getDir();
    }

    static async clearDirectory(): Promise<void> {
        const directory: string = Write.getDirectory();
        const files: string[] = await fs.readdir(directory);

        for (const file of files) {
            const filePath = path.join(directory, file);
            try {
                const stat = await fs.stat(filePath);
                if (stat.isDirectory() || file === ".git") continue;
                await fs.access(filePath);
                await fs.unlink(filePath);
            } catch {}
        }
    }

    static async writeData(pageStack: PageStack): Promise<void> {
        if (pageStack.bottom().pageType !== "QUIZZES") {
            throw new Error("Bottom of stack should always be QuizPage");
        }

        const quizzes: Quiz[] = pageStack.bottom().data as Quiz[];
        const directory: string = Write.getDirectory();

        await this.clearDirectory();

        for (const quiz of quizzes) {
            const json: string = JSON.stringify(quiz, null, 4);
            const fileName: string = quiz.fileName;
            const filePath: string = path.join(directory, fileName);

            await fs.writeFile(filePath, json, "utf-8");
        }
    }
}
