import React, { useState } from "react";
import { createContext } from "react";
import { Box, useApp, useInput } from "ink";
import { Question } from "./types.js";
import useStdoutDimensions from "./shared/hooks/useStdoutDimensions.js";
import { QuizMode } from "./Quiz/QuizMode.js";
import { StartMenu } from "./StartMenu/StartMenu.js";
import { LoadGate } from "./shared/components/LoadGate.js";

interface AppContext {
    normal: boolean;
    setNormal: (b: boolean) => void;
    mode: WhichMode;
    setMode: (m: WhichMode) => void;
    questions: Question[] | null;
    setQuestions: (q: Question[]) => void;
}

export const AppContext = createContext<AppContext | null>(null);

export type WhichMode = "QUIZ" | "CHOOSE_QUIZ" | "EDIT" | "START";

export default function App(): React.ReactElement {
    const [cols, rows] = useStdoutDimensions();
    const [normal, setNormal] = useState<boolean>(true);
    const { exit } = useApp();
    const [mode, setMode] = useState<WhichMode>("START");
    const [questions, setQuestions] = useState<Question[] | null>(null);

    useInput((input) => {
        if (normal && input === "q") {
            exit();
        }
    });

    function getContent(): React.ReactNode {
        if (mode === "START") {
            return <StartMenu />;
        }

        if (mode === "QUIZ" && questions) {
            return <QuizMode questions={questions} />;
        }

        if (mode === "CHOOSE_QUIZ") {
            return <LoadGate.ChooseQuestions />;
        }

        if (mode === "EDIT") {
            return <LoadGate.EditQuizzes />;
        }

        throw new Error("Invalid mode");
    }

    return (
        <AppContext.Provider
            value={{
                normal,
                setNormal,
                mode,
                setMode,
                questions,
                setQuestions,
            }}
        >
            <Box alignItems="center" justifyContent="center">
                <Box
                    width={75}
                    flexDirection="column"
                    borderStyle="round"
                    padding={2}
                >
                    {getContent()}
                </Box>
            </Box>
        </AppContext.Provider>
    );
}
