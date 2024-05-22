import React from "react";
import { Box, Text } from "ink";
import { HorizontalLine } from "../shared/components/Lines.js";
import { QI } from "../types.js";
import { InputBox } from "../shared/components/InputBox.js";
import { QuizState } from "./QuizState.js";
import { useQuestionInput } from "./useQuestionInput.js";

export function QuestionInput({
    question,
    state,
    setState,
}: {
    question: QI;
    state: QuizState;
    setState: (s: QuizState) => void;
}): React.ReactElement {
    const { normal, qiState, setInputText } = useQuestionInput(
        question,
        state,
        setState,
    );

    return (
        <Box flexDirection="column" alignItems="center" width={50}>
            <Box
                width="100%"
                justifyContent="space-between"
                alignItems="center"
            >
                <Box borderStyle="round">
                    <Box>
                        <Text>{normal ? "--NORMAL--" : "--INSERT--"}</Text>
                    </Box>
                </Box>
                <Text dimColor>Enter Answer</Text>
            </Box>
            <Box width="100%" justifyContent="center">
                <Text color="yellow" dimColor>
                    {question.q}
                </Text>
            </Box>
            <HorizontalLine />

            {state.showingAnswer ? (
                <AnswerText answer={question.a} />
            ) : (
                <InputBox
                    acceptsInput={!normal}
                    value={qiState.inputText}
                    onChange={setInputText}
                    defaultText={qiState.defaultText}
                    defaultTextColor={qiState.resultColor}
                />
            )}
        </Box>
    );
}

function AnswerText({ answer }: { answer: string }): React.ReactNode {
    return (
        <Box>
            <Text dimColor>{`Answer: ${answer}`}</Text>
        </Box>
    );
}
