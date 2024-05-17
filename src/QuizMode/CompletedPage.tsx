import React, { useState } from "react";
import { QuizState } from "./QuizState.js";
import { Box, Text } from "ink";
import { HorizontalLine } from "../shared/components/Lines.js";
import { Question } from "../types.js";
import { Command } from "../shared/utils/KeyBinds.js";
import { FocusableBox } from "../shared/components/FocusableBox.js";
import { useKeyBinds } from "../shared/hooks/useKeyBinds.js";

interface Redo {
    incorrect: Question[];
    notEval: Question[];
}
interface Props {
    state: QuizState;
    redo: Redo;
}
export function CompletedPage({ state, redo }: Props): React.ReactNode {
    const [currIndex, setCurrIndex] = useState<number>(0);

    const score = state.getScore();
    const evalCount: number = score.yes + score.no;
    const totalCount: number = score.yes + score.no + score.noEval;
    const percentEval: number =
        Math.round((evalCount / totalCount) * 1000) / 10;
    const percentCorrect: number =
        Math.round((score.yes / evalCount) * 1000) / 10;

    const opts: GetEl[] = getNextOptions(redo);
    const optComponents: React.ReactNode[] = opts.map((opt) => {
        return opt(currIndex);
    });

    function handleKeyBinds(command: Command | null): void {
        if (command === "DOWN") {
            currIndex < optComponents.length - 1 && setCurrIndex(currIndex + 1);
        }

        if (command === "UP") {
            currIndex > 0 && setCurrIndex(currIndex - 1);
        }

        if (command === "RETURN_KEY") {
            if (currIndex === 0) {
                //
            }

            if (currIndex === 1) {
                //
            }

            if (currIndex === 2) {
                //
            }

            if (currIndex === 3) {
                //
            }
        }
    }

    useKeyBinds(handleKeyBinds, true);

    return (
        <Box flexDirection="column">
            <Text color="cyan">Quiz Completed!</Text>
            <HorizontalLine />
            <Text>{`Questions Evaluated: ${percentEval}% (${evalCount}/${totalCount})`}</Text>
            <Text>{`From Evaluated:      ${percentCorrect}% (${score.yes}/${evalCount})`}</Text>
            <HorizontalLine />
            {optComponents}
        </Box>
    );
}

type GetEl = (currIndex: number) => React.ReactNode;
interface Opt {
    name: string;
    getEl: GetEl;
}

function getNextOptions(redo: Redo): GetEl[] {
    let incorrect: GetEl | null = null;
    let notEval: GetEl | null = null;
    let both: GetEl | null = null;
    let toStart: GetEl;

    let index: number = 0;
    if (redo.incorrect.length) {
        incorrect = (currIndex: number) => (
            <FocusableBox isFocus={currIndex === index} key={index++}>
                <Text>Retake quiz with incorrect</Text>
            </FocusableBox>
        );
    }

    if (redo.notEval.length) {
        notEval = (currIndex: number) => (
            <FocusableBox isFocus={currIndex === index} key={index++}>
                <Text>Retake quiz with not eval</Text>
            </FocusableBox>
        );
    }

    if (redo.notEval.length && redo.incorrect.length) {
        both = (currIndex: number) => (
            <FocusableBox isFocus={currIndex === index} key={index++}>
                <Text>Retake quiz with incorrect and not eval</Text>
            </FocusableBox>
        );
    }

    toStart = (currIndex: number) => (
        <FocusableBox isFocus={currIndex === index} key={index++}>
            <Text>Start Menu</Text>
        </FocusableBox>
    );

    const items: (GetEl | null)[] = [incorrect, notEval, both, toStart];
    return items.filter((item): item is GetEl => item !== null);
}
