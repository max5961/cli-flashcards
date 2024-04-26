import React from "react";
import { useState, useContext, createContext } from "react";
import { Quiz, MC, QA, QI } from "./interfaces.js";
import { useApp, useInput } from "ink";
import { QuizMode } from "./Components/quizMode/QuizMode.js";
import { CreateMenu } from "./Components/createMode/CreateNew.js";

function getQuiz(quiz: Quiz, sections: Set<string> | null): (MC | QA | QI)[] {
    const listOfQuiz: (MC | QA | QI)[] = [];

    for (const section of quiz.sections) {
        if (!sections || sections.has(section.name)) {
            for (const question of section.questions) {
                listOfQuiz.push(question);
            }
        }
    }

    return listOfQuiz;
}

interface NormalContext {
    normal: boolean;
    setNormal: (b: boolean) => void;
}
export const NormalContext = createContext<NormalContext | null>(null);

export default function App({
    quiz,
    sections,
}: {
    quiz: Quiz;
    sections: Set<string> | null;
}): React.ReactElement {
    const { exit } = useApp();
    const [normal, setNormal] = useState<boolean>(true);

    useInput((input) => {
        if (normal && input === "q") {
            exit();
        }
    });

    // const QuizArray: (MC | QA | QI)[] = getQuiz(quiz, sections);
    // return <QuizMode Quiz={QuizArray} normal={normal} setNormal={setNormal} />;

    return (
        <NormalContext.Provider value={{ normal, setNormal }}>
            <CreateMenu />
        </NormalContext.Provider>
    );
}
