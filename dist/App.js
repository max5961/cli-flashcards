import React from "react";
import { Deck } from "./Cards.js";
import { useApp, useInput } from "ink";
function getQuestions(questions, sections) {
    const listOfQuestions = [];
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
export default function App({ questions, sections, }) {
    const { exit } = useApp();
    useInput((input, key) => {
        if (input === "q" || key.escape) {
            exit();
        }
    });
    const questionsArray = getQuestions(questions, sections);
    return React.createElement(Deck, { questions: questionsArray });
}
//# sourceMappingURL=App.js.map