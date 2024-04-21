import React from "react";
import { useState } from "react";
import { useInput } from "ink";
import { Box, Text } from "ink";
import { MC } from "../../interfaces.js";
import { HorizontalLine } from "../Lines.js";

function MCList({
    choices,
    currIndex,
    highlightCorrect,
    correctAnswer,
}: {
    choices: { [key: string]: string }[];
    currIndex: number;
    highlightCorrect: boolean;
    correctAnswer: string;
}): React.ReactElement {
    return (
        <Box flexDirection="column" flexGrow={1}>
            {choices.map((choice: { [key: string]: string }, index: number) => {
                const choiceMarker = Object.keys(choice)[0];
                const choiceTextContent = choice[choiceMarker];

                let color: string = "white";
                if (index === currIndex) {
                    color = "blue";
                }

                let isInverse: boolean = false;
                if (highlightCorrect) {
                    if (choiceMarker === correctAnswer) {
                        color = "green";
                        isInverse = true;
                    }

                    if (choiceMarker !== correctAnswer && index === currIndex) {
                        color = "red";
                        isInverse = true;
                    }
                }

                return (
                    <Box
                        borderStyle="round"
                        borderColor={color}
                        flexGrow={1}
                        key={index}
                    >
                        <Text
                            color={color}
                            inverse={isInverse}
                        >{`${choiceMarker}: ${choiceTextContent}`}</Text>
                    </Box>
                );
            })}
        </Box>
    );
}

export function MultipleChoice({
    question,
}: {
    question: MC;
}): React.ReactElement {
    const [currIndex, setCurrIndex] = useState<number>(0);
    const [isFlashing, setIsFlashing] = useState<boolean>(false);
    const [highlightCorrect, setHighlightCorrect] = useState<boolean>(false);

    function flashCorrectAnswer(): void {
        setIsFlashing(true);

        // setInterval only has access to the global scoped variables at the time
        // of instantiation of the Interval and given that React is immutable,
        // those old highlightCorrect values that would be otherwise garbage
        // collected because they are no longer relevant would still be used by
        // setInterval and thus no changes would be rendered.  This is the
        // reason for creating a locally scoped variable that is NOT part of
        // React's useState hook
        let localScopedHl: boolean = false;

        const intervalID = setInterval(() => {
            localScopedHl = !localScopedHl;
            setHighlightCorrect(localScopedHl);
        }, 500);

        setTimeout(() => {
            clearInterval(intervalID);
            setIsFlashing(false);
            setHighlightCorrect(false);
        }, 2000);
    }

    useInput((input, key) => {
        if (input === "j" || key.downArrow) {
            if (currIndex === question.choices.length - 1 || isFlashing) {
                return;
            } else {
                setCurrIndex(currIndex + 1);
            }
        }

        if (input === "k" || key.upArrow) {
            if (currIndex === 0 || isFlashing) {
                return;
            } else {
                setCurrIndex(currIndex - 1);
            }
        }

        if (input === "n") {
            setCurrIndex(0);
        }

        if (key.return) {
            if (!isFlashing) {
                flashCorrectAnswer();
            }
        }
    });

    return (
        <Box justifyContent="center" flexDirection="column">
            <Box alignSelf="center">
                <Text color="yellow" dimColor>
                    {question.q}
                </Text>
            </Box>
            <HorizontalLine />
            <MCList
                choices={question.choices}
                currIndex={currIndex}
                highlightCorrect={highlightCorrect}
                correctAnswer={question.a}
            />
        </Box>
    );
}
