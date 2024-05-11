import React from "react";
import { Box, Text } from "ink";

export function Header({
    currIndex,
    QuizLength,
}: {
    currIndex: number;
    QuizLength: number;
}): React.ReactElement {
    return (
        <Box width="100%" borderStyle="round" justifyContent="center">
            <Text>{`Question: ${currIndex}/${QuizLength}`}</Text>
        </Box>
    );
}
