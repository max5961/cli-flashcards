import React from "react";
import { QuizState } from "./QuizState.js";
import { Box, Text } from "ink";
import { HorizontalLine } from "../shared/components/Lines.js";
import { Question } from "../types.js";
import { useCompletedPage } from "./useCompletedPage.js";

interface Redo {
    incorrect: Question[];
    notEval: Question[];
    questions: Readonly<Question[]>; // all questions from original quiz
}

interface Props {
    state: QuizState;
    redo: Redo;
}

export function CompletedPage({ state, redo }: Props): React.ReactNode {
    const { optComponents, percentCorrectText, percentEvalText } =
        useCompletedPage(state, redo);

    return (
        <Box flexDirection="column">
            <Box alignSelf="center">
                <Text color="cyan">Quiz Completed!</Text>
            </Box>
            <HorizontalLine />
            <Text>{`Score From Evaluated:    ${percentCorrectText}`}</Text>
            <Text>{`Questions Evaluated:     ${percentEvalText}`}</Text>
            <HorizontalLine />
            {optComponents}
        </Box>
    );
}
