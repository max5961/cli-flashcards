import React, { useEffect, useState } from "react";
import { createContext } from "react";
import { Box, Text } from "ink";
import { Question } from "./types.js";
import useStdoutDimensions from "./shared/hooks/useStdoutDimensions.js";
import { QuizModeView } from "./QuizMode/QuizModeView.js";
import { StartMenu } from "./StartMenu/StartMenu.js";
import { LoadGate } from "./shared/components/LoadGate.js";
import { Config } from "./shared/utils/ProcessArgs.js";
import { KbState } from "./shared/hooks/useKeyBinds.js";
import { HorizontalLine } from "./shared/components/Lines.js";
import { KeyBindState } from "./shared/components/KeyBindState.js";
import { EditModeView } from "./EditMode/EditModeView.js";
import { PageStack } from "./shared/utils/PageStack.js";

interface AppContext {
    setKbState: (k: KbState) => void;
    mode: WhichMode;
    setMode: (m: WhichMode) => void;
    questions: Question[] | null;
    setQuestions: (q: Question[]) => void;
    newQuiz: (q: Question[]) => void;
    setPreStack: (s: PageStack) => void;
}

export const AppContext = createContext<AppContext | null>(null);

export type WhichMode = "QUIZ" | "SELECT" | "EDIT" | "START" | "FIX";

// initialQuestions generated from optional CLI arguments
interface AppProps {
    initialQuestions: Question[] | null;
    config: Config;
}

export default function App({
    initialQuestions,
    config,
}: AppProps): React.ReactElement {
    const [quizKey, setQuizKey] = useState<number>(0);
    const [mode, setMode] = useState<WhichMode>("START");
    const [questions, setQuestions] = useState<Question[] | null>(
        initialQuestions,
    );
    const [preStack, setPreStack] = useState<PageStack | null>(null);

    const [kbState, setKbState] = useState<KbState>({
        command: null,
        register: "",
    });

    function newQuiz(questions: Question[]): void {
        setMode("QUIZ");
        setQuestions(questions);
        setQuizKey(quizKey + 1);
    }

    // if the cli generates a list of questions, enter quiz mode right away
    useEffect(() => {
        if (questions) {
            setMode("QUIZ");
        }
    }, [questions]);

    function getContent(): React.ReactNode {
        if (mode === "START") {
            return <StartMenu />;
        }

        if (mode === "QUIZ" && questions) {
            return <QuizModeView questions={questions} key={quizKey} />;
        }

        if (mode === "SELECT") {
            return <LoadGate.ChooseQuestions />;
        }

        if (mode === "EDIT") {
            return <LoadGate.EditQuizzes />;
        }

        if (mode === "FIX") {
            return <EditModeView quizzes={[]} preStack={preStack!} />;
        }

        throw new Error("Invalid mode");
    }

    let modeDesc: string = "";
    if (mode === "EDIT" || mode === "FIX") {
        modeDesc = "Edit Mode";
    }
    if (mode === "SELECT") {
        modeDesc = "Selection Mode";
    }

    return (
        <AppContext.Provider
            value={{
                setKbState,
                mode,
                setMode,
                questions,
                setQuestions,
                newQuiz,
                setPreStack,
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
