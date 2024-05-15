import React, { useContext } from "react";
import { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { HorizontalLine } from "../shared/components/Lines.js";
import { QI } from "../types.js";
import { AppContext } from "../App.js";
import { InputBox } from "../shared/components/InputBox.js";
import { useKeyBinds } from "../shared/hooks/useKeyBinds.js";
import { Command } from "../shared/utils/KeyBinds.js";
import { QuizState } from "./QuizState.js";

export function QuestionInput({
    question,
    state,
    setState,
}: {
    question: QI;
    state: QuizState;
    setState: (s: QuizState) => void;
}): React.ReactElement {
    const { normal, setNormal } = useContext(AppContext)!;
    const [input, setInput] = useState<string>("");
    const [defaultText, setDefaultText] = useState<string>("");
    const [resultColor, setResultColor] = useState<"" | "green" | "red">("");

    useEffect(() => {
        setNormal(false);
        setDefaultText("");
        setInput("");
        setResultColor("");

        return () => {
            setNormal(true);
        };
    }, [question]);

    function handleKeyBinds(command: Command | null): void {
        if (command === "EXIT_INSERT") {
            setNormal(true);
            setDefaultText(input);

            if (input === "") return;

            if (input.toUpperCase() === question.a.toUpperCase()) {
                // Intentionally setDefaultText to question.a instead of input
                // If capitalization is important then this emphasizes that.
                // If capitalization is NOT important, then this prevents you from
                // writing the correct answer without caps and not getting notified
                setDefaultText(question.a);
                setInput(question.a);
                setResultColor("green");
                // !state.isMarked() && setState(state.markYes()); // dont update if already evaluated
                setState(state.markYes());
            } else {
                setResultColor("red");
                // !state.isMarked() && setState(state.markNo());
                setState(state.markNo());
            }
        }

        if (command === "ENTER_INSERT") {
            setNormal(false);
            if (state.showingAnswer) {
                setState(state.toggleShowAnswer());
            }
        }

        if (command === "CLEAR") {
            setInput("");
            setNormal(false);
            if (state.showingAnswer) {
                setState(state.toggleShowAnswer());
            }
        }
    }

    useKeyBinds(handleKeyBinds, normal);

    const showingAnswer: React.ReactNode = (
        <Text>{`Answer: ${question.a}`}</Text>
    );

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

            {state.showingAnswer ? (
                showingAnswer
            ) : (
                <InputBox
                    acceptsInput={!normal}
                    value={input}
                    onChange={setInput}
                    defaultText={defaultText}
                    defaultTextColor={resultColor}
                />
            )}
        </Box>
    );
}
