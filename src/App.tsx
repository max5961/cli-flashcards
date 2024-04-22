import React from "react";
import { useState } from "react";
import { Questions, MC, QA, QI } from "./interfaces.js";
import { useApp, useInput } from "ink";
import { Quiz } from "./Components/quizMode/Quiz.js";

function getQuestions(
    questions: Questions,
    sections: Set<string> | null,
): (MC | QA | QI)[] {
    const listOfQuestions: (MC | QA | QI)[] = [];

    for (const section of questions.sections) {
        if (!sections || sections.has(section.name)) {
            for (const question of section.questions) {
                listOfQuestions.push(question);
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
    const [normal, setNormal] = useState<boolean>(true);

    useInput((input) => {
        if (normal && input === "q") {
            exit();
        }
    });

    const questionsArray: (MC | QA | QI)[] = getQuestions(questions, sections);
    return (
        <Quiz
            questions={questionsArray}
            normal={normal}
            setNormal={setNormal}
        />
    );
}
