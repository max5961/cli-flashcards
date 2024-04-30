import React from "react";
import { useState, createContext } from "react";
import { Quiz, QuizData, MC, QA, QI } from "./interfaces.js";
import { useApp, useInput, Box } from "ink";
import { QuizMode } from "./Components/quizMode/QuizMode.js";
import { CurrentPage } from "./Components/createMode/CreateNew.js";
import { getData } from "./readDir.js";
import useStdoutDimensions from "./useStdoutDimensions.js";

const initialQuizData: QuizData = getData();

interface NormalContext {
    normal: boolean;
    setNormal: (b: boolean) => void;
}
export const NormalContext = createContext<NormalContext | null>(null);

export default function App(): React.ReactElement {
    const { exit } = useApp();
    const [normal, setNormal] = useState<boolean>(true);
    const [cols, rows] = useStdoutDimensions();

    useInput((input) => {
        if (normal && input === "q") {
            exit();
        }
    });

    return (
        <NormalContext.Provider value={{ normal, setNormal }}>
            <Box alignItems="center" justifyContent="center">
                <Box width={75} flexDirection="column" borderStyle="round">
                    <CurrentPage initialQuizData={initialQuizData} />
                </Box>
            </Box>
        </NormalContext.Provider>
    );
}
