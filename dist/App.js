import React from "react";
import { useApp, useInput } from "ink";
import { Quiz } from "./Components/quizMode/Quiz.js";
function getQuestions(questions, sections) {
    const listOfQuestions = [];
    for (const section of questions.sections) {
        if (!sections || sections.has(section.name)) {
            for (const mcOrQa of section.questions) {
                listOfQuestions.push(mcOrQa);
            }
        }
    }
    return listOfQuestions;
}
export default function App({ questions, sections, }) {
    const { exit } = useApp();
    useInput((input, key) => {
        if (input === "q" || key.escape) {
            exit();
        }
    });
    const questionsArray = getQuestions(questions, sections);
    return React.createElement(Quiz, { questions: questionsArray });
}
//# sourceMappingURL=App.js.map