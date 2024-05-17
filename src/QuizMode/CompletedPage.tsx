import React, { useContext, useState } from "react";
import { QuizState } from "./QuizState.js";
import { Box, Text, useApp } from "ink";
import { HorizontalLine } from "../shared/components/Lines.js";
import { Question } from "../types.js";
import { Command } from "../shared/utils/KeyBinds.js";
import { useKeyBinds } from "../shared/hooks/useKeyBinds.js";
import { AppContext } from "../App.js";
import { FocusableText } from "../shared/components/Focusable.js";

interface Redo {
    incorrect: Question[];
    notEval: Question[];
    questions: Readonly<Question[]>; // all questions (original quiz)
}
interface Props {
    state: QuizState;
    redo: Redo;
}
export function CompletedPage({ state, redo }: Props): React.ReactNode {
    const { newQuiz, setMode } = useContext(AppContext)!;

    const [currIndex, setCurrIndex] = useState<number>(0);

    const opts: Opt[] = getNextOptions(redo);
    const optComponents: React.ReactNode[] = opts.map((opt) => {
        return opt.getEl(currIndex);
    });

    const [optName, setOptName] = useState<OptName>(opts[0].name);

    const { exit } = useApp();

    const score = state.getScore();
    const evalCount: number = score.yes + score.no;
    const totalCount: number = score.yes + score.no + score.noEval;
    const percentEval: number =
        Math.round((evalCount / totalCount) * 1000) / 10;
    const percentCorrect: number =
        Math.round((score.yes / evalCount) * 1000) / 10;

    function handleKeyBinds(command: Command | null): void {
        if (command === "DOWN") {
            if (currIndex >= optComponents.length - 1) return;
            setOptName(opts[currIndex + 1].name);
            setCurrIndex(currIndex + 1);
        }

        if (command === "UP") {
            if (currIndex <= 0) return;
            setOptName(opts[currIndex - 1].name);
            setCurrIndex(currIndex - 1);
        }

        if (command === "RETURN_KEY") {
            if (optName === "INCORRECT") {
                newQuiz(redo.incorrect);
            }

            if (optName === "NOT_EVAL") {
                newQuiz(redo.notEval);
            }

            if (optName === "BOTH") {
                newQuiz([...redo.incorrect, ...redo.notEval]);
            }

            if (optName === "RETAKE") {
                newQuiz([...redo.questions]);
            }

            if (optName === "TO_START") {
                setMode("START");
            }

            if (optName === "QUIT") {
                exit();
            }
        }
    }

    useKeyBinds(handleKeyBinds, true);

    return (
        <Box flexDirection="column">
            <Box alignSelf="center">
                <Text color="cyan">Quiz Completed!</Text>
            </Box>
            <HorizontalLine />
            <Text>{`From Evaluated:      ${percentCorrect}% (${score.yes}/${evalCount})`}</Text>
            <Text>{`Questions Evaluated: ${percentEval}% (${evalCount}/${totalCount})`}</Text>
            <HorizontalLine />
            {optComponents}
        </Box>
    );
}

type GetEl = (currIndex: number) => React.ReactNode;
type OptName =
    | "INCORRECT"
    | "NOT_EVAL"
    | "BOTH"
    | "TO_START"
    | "RETAKE"
    | "QUIT";
interface Opt {
    name: OptName;
    getEl: GetEl;
}

function getNextOptions(redo: Redo): Opt[] {
    let incorrect: Opt | null = null;
    let notEval: Opt | null = null;
    let both: Opt | null = null;
    let toStart: Opt;
    let reTake: Opt;
    let quit: Opt;

    let index: number = 0;
    if (redo.incorrect.length) {
        incorrect = {
            name: "INCORRECT",
            getEl: (currIndex: number) => (
                <FocusableText
                    isFocus={currIndex === index}
                    textContent={"Retake Incorrect"}
                    key={index++}
                />
            ),
        };
    }

    if (redo.notEval.length) {
        notEval = {
            name: "NOT_EVAL",
            getEl: (currIndex: number) => (
                <FocusableText
                    isFocus={currIndex === index}
                    textContent={"Retake No Eval"}
                    key={index++}
                />
            ),
        };
    }

    if (redo.notEval.length && redo.incorrect.length) {
        both = {
            name: "BOTH",
            getEl: (currIndex: number) => (
                <FocusableText
                    isFocus={currIndex === index}
                    textContent={"Retake Incorrect & No Eval"}
                    key={index++}
                />
            ),
        };
    }

    reTake = {
        name: "RETAKE",
        getEl: (currIndex: number) => (
            <FocusableText
                isFocus={currIndex === index}
                textContent={"Retake All"}
                key={index++}
            />
        ),
    };

    toStart = {
        name: "TO_START",
        getEl: (currIndex: number) => (
            <FocusableText
                isFocus={currIndex === index}
                textContent={"Start Menu"}
                key={index++}
            />
        ),
    };

    quit = {
        name: "QUIT",
        getEl: (currIndex: number) => (
            <FocusableText
                isFocus={currIndex === index}
                textContent={"Quit"}
                key={index++}
            />
        ),
    };

    const items: (Opt | null)[] = [
        incorrect,
        notEval,
        both,
        reTake,
        toStart,
        quit,
    ];
    return items.filter((item): item is Opt => item !== null);
}
