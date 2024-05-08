import React, { useEffect, useState } from "react";
import { createContext } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { Question, Quiz } from "./types.js";
import { CurrentPageView } from "./components/create/Pages.js";
import Read from "./utils/Read.js";
import useStdoutDimensions from "./hooks/useStdoutDimensions.js";
import { QuizMode } from "./components/quiz/QuizMode.js";
import { StartMenu } from "./components/start/StartMenu.js";
import { ChoosePages } from "./components/choose/ChoosePages.js";

interface NormalContext {
    normal: boolean;
    setNormal: (b: boolean) => void;
}

export const NormalContext = createContext<NormalContext | null>(null);

export type WhichMode = "QUIZ" | "EDIT" | "START";

export default function App(): React.ReactElement {
    const [cols, rows] = useStdoutDimensions();
    const [normal, setNormal] = useState<boolean>(true);
    const { exit } = useApp();
    const [mode, setMode] = useState<WhichMode>("START");
    const [quiz, setQuiz] = useState<Question[] | null>(null);
    const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);

    async function getQuizzes(): Promise<void> {
        const initialQuizzes = await Read.getData();
        setQuizzes(initialQuizzes);
    }

    function getContent(): React.ReactNode {
        let content: React.ReactNode;
        if (mode === "START") {
            content = <StartMenu setMode={setMode} />;
        } else if (mode === "QUIZ") {
            if (!quiz) {
                content = (
                    <ChoosePages
                        setMode={setMode}
                        setQuiz={setQuiz}
                        initialQuizzes={quizzes!}
                    />
                );
            } else {
                content = <QuizMode Quiz={quiz} />;
            }
        } else if (mode === "EDIT") {
            content = <CurrentPageView initialQuizzes={quizzes!} />;
        } else {
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
    return (
        <NormalContext.Provider value={{ normal, setNormal }}>
            <Box alignItems="center" justifyContent="center">
                <Box
                    width={75}
                    flexDirection="column"
                    borderStyle="round"
                    padding={2}
                >
                    {quizzes ? getContent() : <Text>Loading data...</Text>}
                </Box>
            </Box>
        </NormalContext.Provider>
    );
}
