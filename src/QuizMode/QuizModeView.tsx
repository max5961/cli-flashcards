import React, { useContext } from "react";
import { useState } from "react";
import { Box, Text } from "ink";
import { Question } from "../types.js";
import { Header } from "./Header.js";
import { MultipleChoice } from "./MultipleChoice.js";
import { QuestionAnswer } from "./QuestionAnswer.js";
import { QuestionInput } from "./QuestionInput.js";
import { AppContext } from "../App.js";
import { useKeyBinds } from "../shared/hooks/useKeyBinds.js";
import { Command } from "../shared/utils/KeyBinds.js";
import Spinner from "ink-spinner";
import { HorizontalLine } from "../shared/components/Lines.js";
import { QuizState } from "./QuizState.js";

export function QuizModeView({
    questions,
}: {
    questions: Readonly<Question[]>;
}): React.ReactElement {
    const { normal } = useContext(AppContext)!;
    const [message, setMessage] = useState<React.ReactNode>(<></>);
    const [state, setState] = useState<QuizState>(new QuizState(questions, {}));

    const question: Question = state.getQuestion(questions);

    function handleKeyBinds(command: Command | null): void {
        if (command === "LEFT") {
            setState(state.prevQuestion());
        }

        if (command === "RIGHT") {
            setState(state.nextQuestion());
        }

        if (command === "UP") {
            setState(state.moveFocusUp(questions));
        }

        if (command === "DOWN") {
            setState(state.moveFocusDown(questions));
        }

        if (command === "MARK_NO") {
            setState(state.markNo());
        }

        if (command === "MARK_YES") {
            setState(state.markYes());
        }

        if (command === "TOGGLE_SHOW_ANSWER") {
            setState(state.toggleShowAnswer());
        }

        if (command === "RETURN_KEY") {
            if (question.type === "mc") {
                setState(state.chooseMc(question));
            }
        }

        if (command === "SHUFFLE") {
            setState(state.shuffle());
            const randomizing: React.ReactNode = (
                <Text>
                    <Text color="cyan">
                        <Spinner type="dots" />
                    </Text>
                    {" Shuffling next questions"}
                </Text>
            );

            setMessage(randomizing);
            setTimeout(() => {
                setMessage(<></>);
            }, 1000);
        }
    }

    useKeyBinds(handleKeyBinds, normal);

    function currentCard(): React.ReactElement {
        if (question.type === "mc") {
            return <MultipleChoice question={question} state={state} />;
        }
        if (question.type === "qa") {
            return (
                <QuestionAnswer
                    question={question}
                    showingAnswer={state.showingAnswer}
                />
            );
        }
        if (question.type === "qi") {
            return (
                <QuestionInput
                    question={question}
                    state={state}
                    setState={setState}
                />
            );
        }
        throw new Error("Invalid current question type");
    }

    const score = state.getScore();

    return (
        <Box
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
        >
            <Header state={state} message={message} />
            <HorizontalLine />
            <Box margin={2}>{currentCard()}</Box>
            <HorizontalLine />
            <Box
                width="100%"
                justifyContent="space-between"
                alignItems="center"
            >
                <Text dimColor>{`Correct: ${score.yes}`}</Text>
                <Text dimColor>{`Incorrect: ${score.no}`}</Text>
                <Text dimColor>{`Unanswered/Skipped: ${score.noEval}`}</Text>
            </Box>
        </Box>
    );
}
