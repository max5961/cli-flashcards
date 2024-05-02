import fs from "node:fs/promises";
import { Quiz } from "../types.js";
import Read from "./Read.js";

export async function processArguments(): Promise<void> {
    if (process.argv.length < 1) {
        process.stdout.write("Add a json file arg brah");
    }

    try {
        const sections: Set<string> = new Set();
        let jsonFile: string | null = null;

        let jsonCount = 0;
        for (let i = 2; i < process.argv.length; ++i) {
            const arg = process.argv[i];

            if (arg.match(/\w+\.json$/)) {
                jsonFile = arg;
                ++jsonCount;
                if (jsonCount > 1) {
                    throw new Error("Too many json files as arguments");
                }
            } else {
                sections.add(arg);
            }
        }

        if (!jsonFile) {
            throw new Error("Must include json file as an argument");
        }

        const quizJson: string = await fs.readFile(jsonFile, "utf-8");
        const quiz: Quiz = JSON.parse(quizJson);

        if (!Read.validateQuizObject(quiz)) {
            throw new Error("Invalid json format bro");
        }

        let sectionsOrNull: Set<string> | null;
        if (!sections.size) {
            sectionsOrNull = null;
        } else {
            sectionsOrNull = sections;
            console.log(sections);
        }
    } catch (err) {
        console.error(err);
        process.exit(0);
    }
}
