import React from "react";
import { useState } from "react";
import { Text, Box, useInput, useApp } from "ink";
import { QA, MC } from "./interfaces.js";
import useStdoutDimensions from "./useStdoutDimensions.js";

function QuestionAnswer({ question }: { question: QA }): React.ReactElement {
    const [flipped, setFlipped] = useState<boolean>(false);

    let textContent: string;
    if (flipped) {
        textContent = question.a;
    } else {
        textContent = question.q;
    }

    useInput((input: string) => {
        if (input === "f") {
            setFlipped(!flipped);
        } else if (input === "n") {
            setFlipped(false);
        }
    });

    return (
        <>
            <Text>{textContent}</Text>
        </>
    );
}

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

function MultipleChoice({ question }: { question: MC }): React.ReactElement {
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
            <Text>{question.q}</Text>
            <MCList
                choices={question.choices}
                currIndex={currIndex}
                highlightCorrect={highlightCorrect}
                correctAnswer={question.a}
            />
        </Box>
    );
}

export function Deck({
    questions,
}: {
    questions: (MC | QA)[];
}): React.ReactElement {
    const [currIndex, setCurrIndex] = useState<number>(0);
    const [currQuestion, setCurrQuestion] = useState<MC | QA>(questions[0]);
    const [columns, rows] = useStdoutDimensions();
    const { exit } = useApp();

    useInput((input, key) => {
        if (input === "n") {
            if (currIndex === questions.length - 1) {
                exit();
                return;
            } else {
                setCurrQuestion(questions[currIndex + 1]);
                setCurrIndex(currIndex + 1);
            }
        }
    });

    return (
        <Box
            alignItems="center"
            justifyContent="center"
            height={rows}
            width={columns}
        >
            <Box flexDirection="column" borderStyle="round" width={50}>
                {currQuestion.type === "mc" ? (
                    <MultipleChoice question={currQuestion} />
                ) : (
                    <QuestionAnswer question={currQuestion} />
                )}
            </Box>
        </Box>
    );
}
