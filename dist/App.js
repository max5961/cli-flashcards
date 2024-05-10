import React, { useEffect, useState } from "react";
import { createContext } from "react";
import { Box, useApp, useInput } from "ink";
import useStdoutDimensions from "./shared/hooks/useStdoutDimensions.js";
import { QuizMode } from "./Quiz/QuizMode.js";
import { StartMenu } from "./StartMenu/StartMenu.js";
import { LoadGate } from "./shared/components/LoadGate.js";
export const AppContext = createContext(null);
export default function App({ initialQuestions, config, }) {
    const [normal, setNormal] = useState(true);
    const { exit } = useApp();
    const [mode, setMode] = useState("START");
    const [questions, setQuestions] = useState(initialQuestions);
    // if the cli generates a list of questions, enter quiz mode right away
    useEffect(() => {
        if (questions) {
            setMode("QUIZ");
        }
    }, [questions]);
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
        React.createElement(MainContainer, { config: config },
            React.createElement(Box, { width: 75, flexDirection: "column", borderStyle: "round", padding: 2 }, getContent()))));
}
function MainContainer({ config, children, }) {
    const [cols, rows] = useStdoutDimensions();
    if (config.fullscreen) {
        return (React.createElement(Box, { alignItems: "center", justifyContent: "center", height: rows, width: cols }, children));
    }
    return (React.createElement(Box, { alignItems: "center", justifyContent: "center" }, children));
}
//# sourceMappingURL=App.js.map