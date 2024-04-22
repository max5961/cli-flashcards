import React from "react";
import { useState } from "react";
import { useApp, useInput } from "ink";
import { Quiz } from "./Components/quizMode/Quiz.js";
function getQuestions(questions, sections) {
    const listOfQuestions = [];
    for (const section of questions.sections) {
        if (!sections || sections.has(section.name)) {
            for (const question of section.questions) {
                listOfQuestions.push(question);
            }
        }
    }
    return listOfQuestions;
}
export default function App({ questions, sections, }) {
    const { exit } = useApp();
    const [normal, setNormal] = useState(true);
    useInput((input) => {
        if (normal && input === "q") {
            exit();
        }
    });
    const questionsArray = getQuestions(questions, sections);
    return (React.createElement(Quiz, { questions: questionsArray, normal: normal, setNormal: setNormal }));
}
//# sourceMappingURL=App.js.map