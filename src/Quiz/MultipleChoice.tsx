import React from "react";
import { Box, Text } from "ink";
import { MC } from "../types.js";
import { HorizontalLine } from "../shared/components/Lines.js";
import { FocusableBox } from "../shared/components/FocusableBox.js";
import { QuizState } from "./QuizState.js";

export function MultipleChoice({
    question,
    state,
}: {
    question: MC;
    state: QuizState;
}): React.ReactNode {
    return (
        <Box justifyContent="center" flexDirection="column" width={50}>
            <Box alignSelf="center">
                <Text color="yellow" dimColor>
                    {question.q}
                </Text>
            </Box>
            <HorizontalLine />
            <Choices question={question} state={state} />
        </Box>
    );
}

export function Choices({
    question,
    state,
}: {
    question: MC;
    state: QuizState;
}): React.ReactNode {
    function getAnswerIndex(): number {
        const answer: string = question.a.toUpperCase();
        let index: number;
        for (let i = 0; i < question.choices.length; ++i) {
            if (String.fromCharCode(65 + i) === answer) {
                index = i;
            }
        }
        return index!;
    }

    return question.choices.map((choice: string, index: number) => {
        const isFocus: boolean = index === state.mcIndex;
        const textContent: string = `${String.fromCharCode(65 + index)}: ${choice}`;
        const answerIndex = getAnswerIndex();

        if (state.showingAnswer && answerIndex === index) {
            return (
                <FocusableBox isFocus={true} borderColor="green">
                    <Text color="green">{textContent}</Text>
                </FocusableBox>
            );
        }

        if (state.highlightChoice && state.mcIndex === index) {
            const color = answerIndex === index ? "green" : "red";
            return (
                <FocusableBox isFocus={true} borderColor={color}>
                    <Text color={color}>{textContent}</Text>
                </FocusableBox>
            );
        }

        return (
            <FocusableBox isFocus={isFocus}>
                <Text>{textContent}</Text>
            </FocusableBox>
        );
    });
}
