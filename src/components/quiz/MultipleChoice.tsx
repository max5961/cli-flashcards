import React from "react";
import { useState } from "react";
import { useInput } from "ink";
import { Box, Text } from "ink";
import { MC } from "../../types.js";

export function MultipleChoice({
    question,
}: {
    question: MC;
}): React.ReactElement {
    const [currIndex, setCurrIndex] = useState<number>(0);

    useInput((input, key) => {
        // move down MC
        if (input === "j" || key.downArrow) {
            if (currIndex === question.choices.length - 1) {
                return;
            } else {
                setCurrIndex(currIndex + 1);
            }
        }

        // move up MC
        if (input === "k" || key.upArrow) {
            if (currIndex === 0) {
                return;
            } else {
                setCurrIndex(currIndex - 1);
            }
        }

        // these keybinds are handled by the Quiz component for next/prev
        // question, but this also ensures that if the next question is Multiple
        // Choice, the index will be set to 0, and the flashing correct/incorrect
        // interval will also be halted
        if (
            input === "n" ||
            input === "h" ||
            key.rightArrow ||
            input === "b" ||
            input === "h" ||
            key.leftArrow
        ) {
            setCurrIndex(0);
        }
    });

    return (
        <Box justifyContent="center" flexDirection="column" width={50}>
            <Box alignSelf="center">
                <Text color="yellow" dimColor>
                    {question.q}
                </Text>
            </Box>
            <MCList
                choices={question.choices}
                currIndex={currIndex}
                correctAnswer={question.a}
            />
        </Box>
    );
}

function MCList({
    choices,
    currIndex,
    correctAnswer,
}: {
    choices: string[];
    currIndex: number;
    correctAnswer: string;
}): React.ReactElement {
    const [highlightAnswer, setHighlightAnswer] = useState<boolean>(false);
    const [highlightChoice, setHighlightChoice] = useState<boolean>(false);
    const [timeoutId, setTimeoutId] = useState<ReturnType<
        typeof setTimeout
    > | null>(null);

    function highlight(
        setHighlight: (b: boolean) => void,
    ): ReturnType<typeof setTimeout> {
        setHighlight(true);

        return setTimeout(() => {
            setHighlight(false);
        }, 1000);
    }

    useInput((input, key) => {
        if (timeoutId) {
            setHighlightChoice(false);
            setHighlightAnswer(false);
        }

        if (input === "a") {
            setTimeoutId(highlight(setHighlightAnswer));
        }

        if (input === "c" || key.return) {
            setTimeoutId(highlight(setHighlightChoice));
        }
    });

    return (
        <Box flexDirection="column" flexGrow={1}>
            {choices.map((choice: string, index: number) => {
                const choiceMarker = String.fromCharCode(65 + index); // [A-D]
                const choiceTextContent = choice;

                // highlight current selected choice
                let color: string = "white";
                if (index === currIndex) {
                    color = "blue";
                }

                let isInverse: boolean = false;

                // highlight user choice
                if (highlightChoice) {
                    if (index === currIndex) {
                        if (choiceMarker === correctAnswer) {
                            color = "green";
                        } else {
                            color = "red";
                        }
                        isInverse = true;
                    }
                }

                // highlight correct answer
                if (highlightAnswer) {
                    if (choiceMarker === correctAnswer) {
                        color = "green";
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
