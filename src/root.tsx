import React from "react";
import { render } from "ink";
import App from "./App.js";
import fs from "node:fs/promises";
import { Questions } from "./interfaces.js";

function validateQuestionsObject(questions: Questions): boolean {
    if (!questions.sections) {
        console.log("JSON object must include 'sections' array.");
        return false;
    }

    for (const section of questions.sections) {
        if (!section.name || !section.questions) {
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

async function processArguments(): Promise<void> {
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

        const questionsJson: string = await fs.readFile(jsonFile, "utf-8");
        const questions: Questions = JSON.parse(questionsJson);

        if (!validateQuestionsObject(questions)) {
            throw new Error("Invalid json format bro");
        }

        let sectionsOrNull: Set<string> | null;
        if (!sections.size) {
            sectionsOrNull = null;
            console.log("Set is empty");
        } else {
            sectionsOrNull = sections;
            console.log("Set is NOT empty");
            console.log(sections);
        }

        console.log(questions);
        render(<App questions={questions} sections={sectionsOrNull} />);
    } catch (err) {
        console.error(err);
        process.exit(0);
    }
}

processArguments();
