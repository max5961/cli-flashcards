import React, { useContext, useReducer, useRef } from "react";
import { useState } from "react";
import { Box, Text } from "ink";
import { Question } from "../types.js";
import { Header } from "./Header.js";
import { MultipleChoice } from "./MultipleChoice.js";
import { QuestionAnswer } from "./QuestionAnswer.js";
import { FooterKeybinds } from "./FooterKeybinds.js";
import { QuestionInput } from "./QuestionInput.js";
import { AppContext } from "../App.js";
import { useKeyBinds } from "../shared/hooks/useKeyBinds.js";
import { Command } from "../shared/utils/KeyBinds.js";
import Spinner from "ink-spinner";
import { HorizontalLine } from "../shared/components/Lines.js";

type Eval = "YES" | "NO" | "NO_EVAL";

// question is derived from QuestionState and the ReadonlyArray<Question> prop
export interface QuestionState {
    // An array of ordered or shuffled pointers to Question objects in the
    // questions array. This way the questions array is never mutated and we can
    // easily link state to Question objects through the eval map
    indexes: number[];

    // Current progress through indexes array
    position: number;

    // The key is this.indexes[this.position] and correlates to the given Question
    // object.  Eval is the self evaluation given
    evalMap: { [key: number]: Eval };

    // is the current Question showing the answer?
    showingAnswer: boolean;
}

// shuffles a portion of the indexes array
function shuffle(nums: number[], s: number, cycles: number = 0): void {
    if (cycles >= 25) return;
    const originalStart = s;

    const getRandom = (s: number, e: number) => {
        return s + Math.floor(Math.random() * (e - s));
    };

    while (s < nums.length) {
        const randomIndex: number = getRandom(s, nums.length);
        const tmpEnd: number = nums[nums.length - 1];
        nums[nums.length - 1] = nums[randomIndex];
        nums[randomIndex] = tmpEnd;
        ++s;
    }

    shuffle(nums, originalStart, ++cycles);
}

function getMapIndexes(questions: ReadonlyArray<Question>): number[] {
    return questions.map((_: Question, i: number) => i);
}

type QuestionActions =
    | "PREV"
    | "NEXT"
    | "MARK_YES"
    | "MARK_NO"
    | "TOGGLE_SHOW_ANSWER"
    | "RANDOMIZE";
function questionReducer(
    questionState: QuestionState,
    action: { type: QuestionActions },
): QuestionState {
    const copy: QuestionState = {
        position: questionState.position,
        indexes: questionState.indexes.slice(),
        evalMap: Object.assign({}, questionState.evalMap),
        showingAnswer: questionState.showingAnswer,
    };

    const evalKey: number = copy.indexes[copy.position];
    switch (action.type) {
        case "PREV":
            if (copy.position <= 0) break;
            --copy.position;
            break;
        case "NEXT":
            if (copy.position >= copy.indexes.length - 1) break;
            ++copy.position;
            break;
        case "MARK_YES":
            copy.evalMap[evalKey] = "YES";
            break;
        case "MARK_NO":
            copy.evalMap[evalKey] = "NO";
            break;
        case "TOGGLE_SHOW_ANSWER":
            copy.showingAnswer = !copy.showingAnswer;
            break;
        case "RANDOMIZE":
            shuffle(copy.indexes, copy.position + 1);
            break;
    }

    return copy;
}

export function QuizMode({
    questions,
}: {
    questions: ReadonlyArray<Question>;
}): React.ReactElement {
    const { normal, setNormal } = useContext(AppContext)!;
    const [message, setMessage] = useState<React.ReactNode>(<></>);

    const [questionState, questionDispatch] = useReducer(questionReducer, {
        position: 0,
        indexes: getMapIndexes(questions),
        evalMap: {},
        showingAnswer: false,
    });

    const question: Question =
        questions[questionState.indexes[questionState.position]];

    function currentCard(): React.ReactElement {
        if (question.type === "mc") {
            return <MultipleChoice question={question} />;
        }
        if (question.type === "qa") {
            return <QuestionAnswer question={question} />;
        }
        if (question.type === "qi") {
            return (
                <QuestionInput
                    question={question}
                    normal={normal}
                    setNormal={setNormal}
                />
            );
        }
        throw new Error("Invalid current question type");
    }

    function getScore(): { [key: string]: number } {
        let yes: number = 0;
        let no: number = 0;
        let noEval: number = 0;

        for (let i = 0; i < questionState.indexes.length; ++i) {
            if (!questionState.evalMap[i]) {
                ++noEval;
                continue;
            }

            if (questionState.evalMap[i] === "YES") {
                ++yes;
            } else {
                ++no;
            }
        }

        return {
            yes,
            no,
            noEval,
        };
    }

    function handleKeyBinds(command: Command | null): void {
        if (command === "LEFT") {
            questionDispatch({ type: "PREV" });
        }

        if (command === "RIGHT") {
            questionDispatch({ type: "NEXT" });
        }

        if (command === "MARK_NO") {
            questionDispatch({ type: "MARK_NO" });
        }

        if (command === "MARK_YES") {
            questionDispatch({ type: "MARK_YES" });
        }

        if (command === "TOGGLE_SHOW_ANSWER") {
            questionDispatch({ type: "TOGGLE_SHOW_ANSWER" });
        }

        if (command === "RANDOMIZE") {
            questionDispatch({ type: "RANDOMIZE" });
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

    const score = getScore();

    return (
        <Box
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
        >
            <Header questionState={questionState} message={message} />
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
