import React from "react";
import { Deck } from "./Cards.js";
import { Questions, MC, QA } from "./interfaces.js";
import { useApp, useInput } from "ink";

function getQuestions(
    questions: Questions,
    sections: Set<string> | null,
): (MC | QA)[] {
    const listOfQuestions: (MC | QA)[] = [];

    for (const section of questions.sections) {
        console.log("1");
        if (!sections || sections.has(section.name)) {
            console.log("2");
            for (const mcOrQa of section.questions) {
                console.log("3");
                listOfQuestions.push(mcOrQa);
            }
        }
    }

    return listOfQuestions;
}

export default function App({
    questions,
    sections,
}: {
    questions: Questions;
    sections: Set<string> | null;
}): React.ReactElement {
    const { exit } = useApp();

    useInput((input, key) => {
        if (input === "q" || key.escape) {
            exit();
        }
    });
    const questionsArray: (MC | QA)[] = getQuestions(questions, sections);
    return <Deck questions={questionsArray} />;
}
