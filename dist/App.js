import React, { useState } from "react";
import { createContext } from "react";
import { Box, useApp, useInput } from "ink";
import useStdoutDimensions from "./shared/hooks/useStdoutDimensions.js";
import { QuizMode } from "./Quiz/QuizMode.js";
import { StartMenu } from "./StartMenu/StartMenu.js";
import { LoadGate } from "./shared/components/LoadGate.js";
export const AppContext = createContext(null);
export default function App() {
    const [cols, rows] = useStdoutDimensions();
    const [normal, setNormal] = useState(true);
    const { exit } = useApp();
    const [mode, setMode] = useState("START");
    const [questions, setQuestions] = useState(null);
    useInput((input) => {
        if (normal && input === "q") {
            exit();
        }
    });
    function getContent() {
        if (mode === "START") {
            return React.createElement(StartMenu, null);
        }
        if (mode === "QUIZ" && questions) {
            return React.createElement(QuizMode, { questions: questions });
        }
        if (mode === "CHOOSE_QUIZ") {
            return React.createElement(LoadGate.ChooseQuestions, null);
        }
        if (mode === "EDIT") {
            return React.createElement(LoadGate.EditQuizzes, null);
        }
        throw new Error("Invalid mode");
    }
    return (React.createElement(AppContext.Provider, { value: {
            normal,
            setNormal,
            mode,
            setMode,
            questions,
            setQuestions,
        } },
        React.createElement(Box, { alignItems: "center", justifyContent: "center" },
            React.createElement(Box, { width: 75, flexDirection: "column", borderStyle: "round", padding: 2 }, getContent()))));
}
//# sourceMappingURL=App.js.map