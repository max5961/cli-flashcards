import React from "react";
import { useState } from "react";
import { useInput } from "ink";
import { Box, Text } from "ink";
import { HorizontalLine } from "../Lines.js";
import { QA } from "../../interfaces.js";

export function QuestionAnswer({
    question,
}: {
    question: QA;
}): React.ReactElement {
    const [flipped, setFlipped] = useState<boolean>(false);

    useInput((input: string) => {
        if (input === "f") {
            setFlipped(!flipped);
        } else if (input === "n") {
            setFlipped(false);
        }
    });

    return (
        <Box flexDirection="column" alignItems="center" width={50}>
            <Box width="100%" justifyContent="center">
                <Text color="yellow" dimColor>
                    {flipped ? "Answer" : "Question"}
                </Text>
            </Box>
            <HorizontalLine />
            <Text>{flipped ? question.a : question.q}</Text>
        </Box>
    );
}
