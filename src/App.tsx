import React from "react";
import { Deck } from "./Cards.js";
import { Questions, MC, QA } from "./interfaces.js";
import { useApp, useInput } from "ink";
import { Quiz } from "./Components/quizMode/Quiz.js";

function getQuestions(
    questions: Questions,
    sections: Set<string> | null,
): (MC | QA)[] {
    const listOfQuestions: (MC | QA)[] = [];

    for (const section of questions.sections) {
        if (!sections || sections.has(section.name)) {
            for (const mcOrQa of section.questions) {
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
    return <Quiz questions={questionsArray} />;
}
