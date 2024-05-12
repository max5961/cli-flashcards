import React from "react";
import { Box, Text } from "ink";
import { QuestionState } from "./QuizMode.js";

export function Header({
    questionState,
    message,
}: {
    questionState: QuestionState;
    message: React.ReactNode;
}): React.ReactElement {
    return (
        <Box width="100%" justifyContent="space-between" alignItems="center">
            <Text>{`Question: ${questionState.position + 1}/${questionState.indexes.length}`}</Text>
            {message}
        </Box>
    );
}
