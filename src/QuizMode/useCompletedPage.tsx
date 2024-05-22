import React from "react";
import { useContext, useState } from "react";
import { Question } from "../types.js";
import { QuizState } from "./QuizState.js";
import { AppContext } from "../App.js";
import { useApp } from "ink";
import { Command } from "../shared/utils/KeyBinds.js";
import { useKeyBinds } from "../shared/hooks/useKeyBinds.js";
import { FocusableText } from "../shared/components/Focusable.js";

interface CmpState {
    currIdx: number;
    optName: OptName;
}

interface Redo {
    incorrect: Question[];
    notEval: Question[];
    questions: Readonly<Question[]>; // all questions from original quiz
}

export function useCompletedPage(state: QuizState, redo: Redo) {
    const { newQuiz, setMode } = useContext(AppContext)!;

    const opts: Opt[] = getNextOptions(redo);

    const [cmpState, setCmpState] = useState<CmpState>({
        currIdx: 0,
        optName: opts[0].name,
    });

    const optComponents: React.ReactNode[] = opts.map((opt) => {
        // Pass in currIdx to check to set the isFocus (highlight) for the component
        return opt.getComp(cmpState.currIdx);
    });

    const score = state.getScore();
    const evalCount: number = score.yes + score.no;
    const totalCount: number = score.yes + score.no + score.noEval;

    let percentCorrect: number;
    if (evalCount === 0) {
        percentCorrect = 0;
    } else {
        percentCorrect = Math.round((score.yes / evalCount) * 1000) / 10;
    }

    const percentEval: number =
        Math.round((evalCount / totalCount) * 1000) / 10;

    const percentCorrectText: string = `${percentCorrect}% (${score.yes}/${evalCount})`;
    const percentEvalText: string = `${percentEval}% (${evalCount}/${totalCount})`;

    const { exit } = useApp();

    function handleKeyBinds(command: Command | null): void {
        if (command === "DOWN") {
            if (cmpState.currIdx >= optComponents.length - 1) return;
            setCmpState({
                currIdx: cmpState.currIdx + 1,
                optName: opts[cmpState.currIdx + 1].name,
            });
        }

        if (command === "UP") {
            if (cmpState.currIdx <= 0) return;
            setCmpState({
                currIdx: cmpState.currIdx - 1,
                optName: opts[cmpState.currIdx - 1].name,
            });
        }

        if (command === "RETURN_KEY") {
            if (cmpState.optName === "INCORRECT") {
                newQuiz(redo.incorrect);
            }

            if (cmpState.optName === "NOT_EVAL") {
                newQuiz(redo.notEval);
            }

            if (cmpState.optName === "BOTH") {
                newQuiz([...redo.incorrect, ...redo.notEval]);
            }

            if (cmpState.optName === "RETAKE") {
                newQuiz([...redo.questions]);
            }

            if (cmpState.optName === "TO_START") {
                setMode("START");
            }

            if (cmpState.optName === "QUIT") {
                exit();
            }
        }
    }

    useKeyBinds(handleKeyBinds, true);

    return { optComponents, percentCorrectText, percentEvalText };
}

type GetComp = (currIndex: number) => React.ReactNode;
type OptName =
    | "INCORRECT"
    | "NOT_EVAL"
    | "BOTH"
    | "TO_START"
    | "RETAKE"
    | "QUIT";
interface Opt {
    name: OptName;
    getComp: GetComp;
}

function getNextOptions(redo: Redo): Opt[] {
    const options: Opt[] = [];

    let index: number = 0;
    if (redo.incorrect.length) {
        options.push({
            name: "INCORRECT",
            getComp: (currIndex: number) => (
                <FocusableText
                    isFocus={currIndex === index}
                    textContent={"Retake Incorrect"}
                    key={index++}
                />
            ),
        });
    }

    if (redo.notEval.length) {
        options.push({
            name: "NOT_EVAL",
            getComp: (currIndex: number) => (
                <FocusableText
                    isFocus={currIndex === index}
                    textContent={"Retake No Eval"}
                    key={index++}
                />
            ),
        });
    }

    if (redo.notEval.length && redo.incorrect.length) {
        options.push({
            name: "BOTH",
            getComp: (currIndex: number) => (
                <FocusableText
                    isFocus={currIndex === index}
                    textContent={"Retake Incorrect & No Eval"}
                    key={index++}
                />
            ),
        });
    }

    options.push({
        name: "RETAKE",
        getComp: (currIndex: number) => (
            <FocusableText
                isFocus={currIndex === index}
                textContent={"Retake All"}
                key={index++}
            />
        ),
    });

    options.push({
        name: "TO_START",
        getComp: (currIndex: number) => (
            <FocusableText
                isFocus={currIndex === index}
                textContent={"Start Menu"}
                key={index++}
            />
        ),
    });

    options.push({
        name: "QUIT",
        getComp: (currIndex: number) => (
            <FocusableText
                isFocus={currIndex === index}
                textContent={"Quit"}
                key={index++}
            />
        ),
    });

    return options;
}
