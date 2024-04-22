import React from "react";
import { Box, Text, useInput } from "ink";
import { useState } from "react";
import { HorizontalLine } from "../Lines.js";
import { QuizFileData, Questions } from "../../interfaces.js";

export function ListQuizzes({
    quizzes,
}: {
    quizzes: QuizFileData[];
}): React.ReactElement {
    const [currIndex, setCurrIndex] = useState<number>(0);

    function handleEnter(): void {
        //
    }

    useInput((input, key) => {
        if (input === "j" || key.downArrow) {
            if (currIndex >= quizzes.length) {
                return;
            }
            setCurrIndex(currIndex + 1);
        }

        if (input === "k" || key.upArrow) {
            if (currIndex <= 0) {
                return;
            }
            setCurrIndex(currIndex - 1);
        }

        if (key.return || input === "l") {
            handleEnter();
        }
    });

    return (
        <>
            <Box alignSelf="center">
                <Text color="yellow" dimColor>
                    Quizzes
                </Text>
            </Box>
            <HorizontalLine />
            <Box borderStyle={currIndex === 0 ? "classic" : "round"}>
                <Text inverse={currIndex === 0}>
                    <Text color="green" inverse={currIndex === 0}>
                        {" [+] "}
                    </Text>
                    Add Quiz
                </Text>
            </Box>
            {quizzes &&
                quizzes.map((quiz, index) => {
                    return (
                        <>
                            <Box
                                key={index}
                                borderStyle={
                                    index + 1 === currIndex
                                        ? "classic"
                                        : "round"
                                }
                            >
                                <Text inverse={index + 1 === currIndex}>
                                    <Text color="yellow">{" [E] "}</Text>
                                    {quiz.fileName}
                                </Text>
                            </Box>
                        </>
                    );
                })}
        </>
    );
}
