import React from "react";
import { useState } from "react";
import { useInput } from "ink";
import { Box } from "ink";
import { QA, MC } from "../../interfaces.js";
import useStdoutDimensions from "../../useStdoutDimensions.js";
import { Header } from "./Header.js";
import { MultipleChoice } from "./MultipleChoice.js";
import { QuestionAnswer } from "./QuestionAnswer.js";
import { FooterKeybinds } from "./FooterKeybinds.js";

export function Quiz({
    questions,
}: {
    questions: (QA | MC)[];
}): React.ReactElement {
    const [currIndex, setCurrIndex] = useState<number>(0);
    const [currQuestion, setCurrQuestion] = useState<MC | QA>(questions[0]);
    const [columns, rows] = useStdoutDimensions();

    useInput((input, key) => {
        if (input === "n" || input === "l" || key.rightArrow) {
            if (currIndex === questions.length - 1) {
                return;
            } else {
                setCurrQuestion(questions[currIndex + 1]);
                setCurrIndex(currIndex + 1);
            }
        }

        if (input === "b" || input === "h" || key.leftArrow) {
            if (currIndex === 0) {
                return;
            } else {
                setCurrQuestion(questions[currIndex - 1]);
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
        throw new Error("Invalid current question type");
    }

    return (
        <Box
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
            height={rows}
            width={columns}
        >
            <Header currIndex={currIndex} questionsLength={questions.length} />
            {currentCard()}
            <FooterKeybinds columns={columns} />
        </Box>
    );
}
