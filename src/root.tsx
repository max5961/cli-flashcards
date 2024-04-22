import React from "react";
import { render } from "ink";
import App from "./App.js";
import fs from "node:fs/promises";
import { Quiz } from "./interfaces.js";

function validateQuizObject(quiz: Quiz): boolean {
    if (!quiz.sections) {
        console.log("1");
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
                console.log("3");
                return false;
            }

            if (question.type === "qa" || question.type === "qi") {
                if (!question.q || !question.a) {
                    console.log("4");
                    return false;
                }
            }

            if (question.type === "mc") {
                if (!question.q || !question.a || !question.choices) {
                    console.log("5");
                    return false;
                }

                if (!Array.isArray(question.choices)) {
                    console.log("6");
                    return false;
                }

                let hasValidAnswer: boolean = false;
                for (const obj of question.choices) {
                    for (const key in obj) {
                        if (typeof key !== "string") {
                            console.log("7");
                            return false;
                        }

                        if (typeof obj[key] !== "string") {
                            console.log("8");
                            return false;
                        }
                        if (key === question.a) {
                            hasValidAnswer = true;
                        }
                    }
                }

                if (!hasValidAnswer) {
                    console.log("9");
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

        const quizJson: string = await fs.readFile(jsonFile, "utf-8");
        const quiz: Quiz = JSON.parse(quizJson);

        if (!validateQuizObject(quiz)) {
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

        console.log(quiz);
        render(<App quiz={quiz} sections={sectionsOrNull} />);
    } catch (err) {
        console.error(err);
        process.exit(0);
    }
}

processArguments();
