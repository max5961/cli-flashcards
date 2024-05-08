var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useEffect, useState } from "react";
import { createContext } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { CurrentPageView } from "./components/create/Pages.js";
import Read from "./utils/Read.js";
import useStdoutDimensions from "./hooks/useStdoutDimensions.js";
import { QuizMode } from "./components/quiz/QuizMode.js";
import { StartMenu } from "./components/start/StartMenu.js";
import { ChoosePages } from "./components/choose/ChoosePages.js";
export const NormalContext = createContext(null);
export default function App() {
    const [cols, rows] = useStdoutDimensions();
    const [normal, setNormal] = useState(true);
    const { exit } = useApp();
    const [mode, setMode] = useState("START");
    const [quiz, setQuiz] = useState(null);
    const [quizzes, setQuizzes] = useState(null);
    function getQuizzes() {
        return __awaiter(this, void 0, void 0, function* () {
            const initialQuizzes = yield Read.getData();
            setQuizzes(initialQuizzes);
        });
    }
    function getContent() {
        let content;
        if (mode === "START") {
            content = React.createElement(StartMenu, { setMode: setMode });
        }
        else if (mode === "QUIZ") {
            if (!quiz) {
                content = (React.createElement(ChoosePages, { setMode: setMode, setQuiz: setQuiz, initialQuizzes: quizzes }));
            }
            else {
                content = React.createElement(QuizMode, { Quiz: quiz });
            }
        }
        else if (mode === "EDIT") {
            content = React.createElement(CurrentPageView, { initialQuizzes: quizzes });
        }
        else {
            throw new Error("Invalid mode");
        }
        return content;
    }
    useInput((input) => {
        if (normal && input === "q") {
            exit();
        }
    });
    useEffect(() => {
        getQuizzes();
    }, []);
    return (React.createElement(NormalContext.Provider, { value: { normal, setNormal } },
        React.createElement(Box, { alignItems: "center", justifyContent: "center" },
            React.createElement(Box, { width: 75, flexDirection: "column", borderStyle: "round", padding: 2 }, quizzes ? getContent() : React.createElement(Text, null, "Loading data...")))));
}
//# sourceMappingURL=App.js.map