import React from "react";
import { Box, Text } from "ink";
import { MC, QA, QI, Question } from "../types.js";
import Spinner from "ink-spinner";
import { HorizontalLine } from "../shared/components/Lines.js";
import { QuizState } from "./QuizState.js";
import { useQuestionInput } from "./useQuestionInput.js";
import { FocusableBox } from "../shared/components/Focusable.js";
import { InputBox } from "../shared/components/InputBox.js";
import { Icon } from "../shared/components/Icons.js";
import { RetakeQuestions, useCompletedPage } from "./useCompletedPage.js";
import { useQuizMode } from "./useQuizMode.js";

export function QuizModeView({
    questions,
}: {
    questions: Readonly<Question[]>;
}): React.ReactElement {
    const { message, quizCompleted, getRetakeQuestions, state, setState } =
        useQuizMode(questions);

    // If completed quiz, return early and render CompletedPage
    if (quizCompleted) {
        return <CompletedPage state={state} redo={getRetakeQuestions()} />;
    }

    let messageComponent: React.ReactNode = <></>;
    if (message === "SHUFFLE") {
        messageComponent = (
            <Text>
                <Text color="cyan">
                    <Spinner type="dots" />
                </Text>
                {" Shuffling next questions"}
            </Text>
        );
    }

    const question: Question = state.getQuestion(questions);

    function getContent(): React.ReactElement {
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
            <Header state={state} messageComponent={messageComponent} />
            <HorizontalLine />
            <Box margin={2}>{getContent()}</Box>
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

export function Header({
    state,
    messageComponent,
}: {
    state: QuizState;
    messageComponent: React.ReactNode | null;
}): React.ReactElement {
    return (
        <Box width="100%" justifyContent="space-between" alignItems="center">
            <Text>{`Question: ${state.position + 1}/${state.indexes.length}`}</Text>
            {messageComponent}
            <Icon questionEval={state.getEval()} />
        </Box>
    );
}

function QuestionAnswer({
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

function QuestionInput({
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

function MultipleChoice({
    question,
    state,
}: {
    question: MC;
    state: QuizState;
}): React.ReactNode {
    return (
        <Box justifyContent="center" flexDirection="column" width={50}>
            <Box alignSelf="center">
                <Text color="yellow" dimColor>
                    {question.q}
                </Text>
            </Box>
            <HorizontalLine />
            <Choices question={question} state={state} />
        </Box>
    );
}

export function Choices({
    question,
    state,
}: {
    question: MC;
    state: QuizState;
}): React.ReactNode {
    function getAnswerIndex(): number {
        const answer: string = question.a.toUpperCase();
        let index: number;
        for (let i = 0; i < question.choices.length; ++i) {
            if (String.fromCharCode(65 + i) === answer) {
                index = i;
            }
        }
        return index!;
    }

    return question.choices.map((choice: string, index: number) => {
        const isFocus: boolean = index === state.mcIndex;
        const textContent: string = `${String.fromCharCode(65 + index)}: ${choice}`;
        const answerIndex = getAnswerIndex();

        if (state.showingAnswer && answerIndex === index) {
            return (
                <FocusableBox isFocus={true} borderColor="green" key={index}>
                    <Text color="green">{textContent}</Text>
                </FocusableBox>
            );
        }

        if (state.highlightChoice && state.mcIndex === index) {
            const color = answerIndex === index ? "green" : "red";
            return (
                <FocusableBox isFocus={true} borderColor={color} key={index}>
                    <Text color={color}>{textContent}</Text>
                </FocusableBox>
            );
        }

        return (
            <FocusableBox isFocus={isFocus} key={index}>
                <Text>{textContent}</Text>
            </FocusableBox>
        );
    });
}

interface CmpPageProps {
    state: QuizState;
    redo: RetakeQuestions;
}

function CompletedPage({ state, redo }: CmpPageProps): React.ReactNode {
    const { optComponents, percentCorrectText, percentEvalText } =
        useCompletedPage(state, redo);

    return (
        <Box flexDirection="column">
            <Box alignSelf="center">
                <Text color="yellow" dimColor>
                    Quiz Completed!
                </Text>
            </Box>
            <HorizontalLine />
            <Text>{`Score From Evaluated:    ${percentCorrectText}`}</Text>
            <Text>{`Questions Evaluated:     ${percentEvalText}`}</Text>
            <HorizontalLine />
            {optComponents}
        </Box>
    );
}
