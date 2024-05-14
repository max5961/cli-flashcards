import React, { useEffect, useState } from "react";
import { createContext } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { Question } from "./types.js";
import useStdoutDimensions from "./shared/hooks/useStdoutDimensions.js";
import { QuizMode } from "./Quiz/QuizMode.js";
import { StartMenu } from "./StartMenu/StartMenu.js";
import { LoadGate } from "./shared/components/LoadGate.js";
import { Config } from "./shared/utils/ProcessArgs.js";
import { Command } from "./shared/utils/KeyBinds.js";
import { KbState, useKeyBinds } from "./shared/hooks/useKeyBinds.js";
import { HorizontalLine } from "./shared/components/Lines.js";
import { KeyBindState } from "./shared/components/KeyBindState.js";

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

// initialQuestions generated from optional CLI arguments
interface AppProps {
    initialQuestions: Question[] | null;
    config: Config;
}

export default function App({
    initialQuestions,
    config,
}: AppProps): React.ReactElement {
    const [normal, setNormal] = useState<boolean>(true);
    const { exit } = useApp();
    const [mode, setMode] = useState<WhichMode>("START");
    const [questions, setQuestions] = useState<Question[] | null>(
        initialQuestions,
    );

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

    function handleKeyBinds(command: Command | null): void {
        if (command === "TO_START_MENU") {
            setMode("START");
        }

        if (command === "TO_CHOOSE_MENU") {
            setMode("CHOOSE_QUIZ");
        }

        if (command === "TO_EDIT_MENU") {
            setMode("EDIT");
        }
    }

    let modeDesc: string = "";
    if (mode === "EDIT") {
        modeDesc = "Edit Mode";
    }
    if (mode === "CHOOSE_QUIZ") {
        modeDesc = "Selection Mode";
    }

    const kbState: KbState = useKeyBinds(handleKeyBinds, normal);

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
            <MainContainer config={config}>
                <Box
                    width={75}
                    flexDirection="column"
                    borderStyle="round"
                    padding={2}
                    paddingTop={1}
                >
                    {getContent()}
                    {modeDesc === "" ? <></> : <HorizontalLine marginTop={1} />}
                    <Box alignSelf="flex-start">
                        <Text dimColor>{modeDesc}</Text>
                    </Box>
                </Box>
            </MainContainer>
            <Box
                alignItems="center"
                justifyContent="flex-end"
                height={1}
                margin={1}
            >
                <KeyBindState kbState={kbState} />
            </Box>
        </AppContext.Provider>
    );
}

interface MainContainerProps {
    config: Config;
    children: React.ReactNode;
}
function MainContainer({
    config,
    children,
}: MainContainerProps): React.ReactElement {
    const [cols, rows] = useStdoutDimensions();
    if (config.fullscreen) {
        return (
            <Box
                alignItems="center"
                justifyContent="center"
                height={rows}
                width={cols}
            >
                {children}
            </Box>
        );
    }

    return (
        <Box alignItems="center" justifyContent="center">
            {children}
        </Box>
    );
}
