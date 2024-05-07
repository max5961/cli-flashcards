import React from "react";
import { useState } from "react";
import { useInput } from "ink";
import { Box } from "ink";
import { QA, QI, MC } from "../../types.js";
import { Header } from "./Header.js";
import { MultipleChoice } from "./MultipleChoice.js";
import { QuestionAnswer } from "./QuestionAnswer.js";
import { FooterKeybinds } from "./FooterKeybinds.js";
import { QuestionInput } from "./QuestionInput.js";

export function QuizMode({
    Quiz,
    normal,
    setNormal,
}: {
    Quiz: (QA | MC | QI)[];
    normal: boolean;
    setNormal: (b: boolean) => void;
}): React.ReactElement {
    const [currIndex, setCurrIndex] = useState<number>(0);
    const [currQuestion, setCurrQuestion] = useState<MC | QA | QI>(Quiz[0]);

    useInput((input, key) => {
        // relevant to Question/Input Quiz
        if (!normal) {
            return;
        }

        if (input === "n" || input === "l" || key.rightArrow) {
            if (currIndex === Quiz.length - 1) {
                return;
            } else {
                setCurrQuestion(Quiz[currIndex + 1]);
                setCurrIndex(currIndex + 1);
            }
        }

        if (input === "b" || input === "h" || key.leftArrow) {
            if (currIndex === 0) {
                return;
            } else {
                setCurrQuestion(Quiz[currIndex - 1]);
                setCurrIndex(currIndex - 1);
            }
        }
    });

    function currentCard(): React.ReactElement {
        if (currQuestion.type === "mc") {
            return <MultipleChoice question={currQuestion} />;
        }
        if (currQuestion.type === "qa") {
            return <QuestionAnswer question={currQuestion} />;
        }
        if (currQuestion.type === "qi") {
            return (
                <QuestionInput
                    question={currQuestion}
                    normal={normal}
                    setNormal={setNormal}
                />
            );
        }
        throw new Error("Invalid current question type");
    }

    return (
        <Box
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
        >
            <Header currIndex={currIndex} QuizLength={Quiz.length} />
            {currentCard()}
            <FooterKeybinds />
        </Box>
    );
}
