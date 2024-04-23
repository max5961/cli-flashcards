import React from "react";
import { useState, createContext } from "react";
import { useApp, useInput } from "ink";
import { CreateNew } from "./Components/createMode/CreateNew.js";
function getQuiz(quiz, sections) {
    const listOfQuiz = [];
    for (const section of quiz.sections) {
        if (!sections || sections.has(section.name)) {
            for (const question of section.questions) {
                listOfQuiz.push(question);
            }
        }
    }
    return listOfQuiz;
}
export const NormalContext = createContext(null);
export default function App({ quiz, sections, }) {
    const { exit } = useApp();
    const [normal, setNormal] = useState(true);
    useInput((input) => {
        if (normal && input === "q") {
            exit();
        }
    });
    // const QuizArray: (MC | QA | QI)[] = getQuiz(Quiz, sections);
    // return (
    //     <QuizMode
    //         Quiz={QuizArray}
    //         normal={normal}
    //         setNormal={setNormal}
    //     />
    // );
    return (React.createElement(NormalContext.Provider, { value: { normal, setNormal } },
        React.createElement(CreateNew, null)));
}
//# sourceMappingURL=App.js.map