import React, { useEffect } from "react";
import { useState } from "react";
import { useInput } from "ink";
import { Box, Text } from "ink";
import { HorizontalLine } from "../shared/Lines.js";
import { QA } from "../../types.js";

export function QuestionAnswer({
    question,
}: {
    question: QA;
}): React.ReactElement {
    const [flipped, setFlipped] = useState<boolean>(false);

    useEffect(() => {
        setFlipped(false);
    }, [question]);

    useInput((input: string) => {
        if (input === "f") {
            setFlipped(!flipped);
        } else if (input === "a") {
            setFlipped(true);
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
