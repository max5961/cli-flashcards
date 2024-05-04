import React from "react";
import { useState, useEffect } from "react";
import { useInput } from "ink";
import { Box, Text } from "ink";
import { HorizontalLine } from "../shared/Lines.js";
import { QI } from "../../types.js";
import TextInput from "ink-text-input";

export function QuestionInput({
    question,
    normal,
    setNormal,
}: {
    question: QI;
    normal: boolean;
    setNormal: (b: boolean) => void;
}): React.ReactElement {
    const [input, setInput] = useState<string>("");
    const [checkingAnswer, setCheckingAnswer] = useState<boolean>(false);

    function handleNormalText(): React.ReactElement {
        let color: string = "white";

        // If you exit insert mode with Esc, maybe you don't want to see if the
        // answer is correct?  Only check answers when you press Enter
        if (checkingAnswer) {
            color =
                input.toLowerCase() === question.a.toLowerCase()
                    ? "green"
                    : "red";
        }

        return <Text color={color}>{input}</Text>;
    }

    // Checking input against answers is not case sensitive.  However, it would
    // be nice if when the answer is capitalized for some special meaning and you
    // correctly type the answer it is capitalized as a reminder regardless or
    // your input
    function convertInputIfCorrect(): void {
        if (input.toLowerCase() === question.a.toLowerCase()) {
            setInput(question.a);
        }
    }

    useInput((input, key) => {
        if (key.escape) {
            setNormal(true);
            setCheckingAnswer(false);
        }

        if (key.return) {
            convertInputIfCorrect();
            setNormal(true);
            setCheckingAnswer(true);
        }

        if (input === "i") {
            setNormal(false);
            setCheckingAnswer(false);
        }

        if (normal && input === "c") {
            setInput("");
            setNormal(false);
        }

        if (normal && (input === "a" || input === "f")) {
            setInput(`Answer: ${question.a}`);
        }
    });

    useEffect(() => {
        setNormal(false);

        return () => {
            setNormal(true);
        };
    }, [setNormal]);

    return (
        <Box flexDirection="column" alignItems="center" width={50}>
            <Box flexDirection="row" borderStyle="round" alignSelf="flex-start">
                <Box>
                    <Text>{normal ? "--NORMAL--" : "--INSERT--"}</Text>
                </Box>
            </Box>
            <Box width="100%" justifyContent="center">
                <Text color="yellow" dimColor>
                    {question.q}
                </Text>
            </Box>
            <HorizontalLine />
            {normal ? (
                handleNormalText()
            ) : (
                <TextInput value={input} onChange={setInput} />
            )}
        </Box>
    );
}
