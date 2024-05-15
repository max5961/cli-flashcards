import React from "react";
import { Box, Text } from "ink";
import { HorizontalLine } from "../shared/components/Lines.js";
import { QA } from "../types.js";

export function QuestionAnswer({
    showingAnswer,
    question,
}: {
    question: QA;
    showingAnswer: boolean;
}): React.ReactElement {
    return (
        <Box flexDirection="column" alignItems="center" width={50}>
            <Box width="100%" justifyContent="center">
                <Text color="yellow" dimColor>
                    {showingAnswer ? "Answer" : "Question"}
                </Text>
            </Box>
            <HorizontalLine />
            <Text>{showingAnswer ? question.a : question.q}</Text>
        </Box>
    );
}
