import React from "react";
import { Box, Text } from "ink";

export function Header({
    currIndex,
    questionsLength,
}: {
    currIndex: number;
    questionsLength: number;
}): React.ReactElement {
    return (
        <Box width="100%" borderStyle="round" justifyContent="center">
            <Text>{`Question: ${currIndex + 1}/${questionsLength}`}</Text>
        </Box>
    );
}
