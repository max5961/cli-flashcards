import React from "react";
import { Deck } from "./Cards.js";
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
    const questionsArray = getQuestions(questions, sections);
    return React.createElement(Deck, { questions: questionsArray });
}
//# sourceMappingURL=App.js.map