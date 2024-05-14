import React from "react";
import { Box, Text } from "ink";
import { QuizState } from "./QuizState.js";
import { Icon } from "../shared/components/Icons.js";

export function Header({
    state,
    message,
}: {
    state: QuizState;
    message: React.ReactNode;
}): React.ReactElement {
    return (
        <Box width="100%" justifyContent="space-between" alignItems="center">
            <Text>{`Question: ${state.position + 1}/${state.indexes.length}`}</Text>
            {message}
            <Icon questionEval={state.getEval()} />
        </Box>
    );
}
