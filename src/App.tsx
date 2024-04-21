import React from "react";
import { Deck } from "./Cards.js";
import { Questions, MC, QA } from "./interfaces.js";

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
    const questionsArray: (MC | QA)[] = getQuestions(questions, sections);

    return <Deck questions={questionsArray} />;
}
