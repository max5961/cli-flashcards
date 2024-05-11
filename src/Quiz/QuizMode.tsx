import React, { useContext, useReducer } from "react";
import { useState } from "react";
import { useInput } from "ink";
import { Box } from "ink";
import { QA, QI, MC, Question } from "../types.js";
import { Header } from "./Header.js";
import { MultipleChoice } from "./MultipleChoice.js";
import { QuestionAnswer } from "./QuestionAnswer.js";
import { FooterKeybinds } from "./FooterKeybinds.js";
import { QuestionInput } from "./QuestionInput.js";
import { AppContext } from "../App.js";
import { useKeyBinds } from "../shared/hooks/useKeyBinds.js";
import { Command } from "../shared/utils/KeyBinds.js";

interface QuestionState {
    question: MC | QA | QI;
    index: number;
    questions: (MC | QA | QI)[];
}

type QuestionActions = "PREV" | "NEXT";

function questionReducer(
    questionState: QuestionState,
    action: { type: QuestionActions },
): QuestionState {
    const copy: QuestionState = Object.assign({}, questionState);

    switch (action.type) {
        case "PREV":
            if (copy.index <= 0) break;
            copy.index = copy.index - 1;
            copy.question = copy.questions[copy.index];
            break;
        case "NEXT":
            if (copy.index >= copy.questions.length - 1) break;
            copy.index = copy.index + 1;
            copy.question = copy.questions[copy.index];
            break;
    }

    return copy;
}

export function QuizMode({
    questions,
}: {
    questions: Question[];
}): React.ReactElement {
    const { normal, setNormal } = useContext(AppContext)!;
    const [questionState, questionDispatch] = useReducer(questionReducer, {
        index: 0,
        question: questions[0],
        questions: questions,
    });

    const question: Question = questionState.question;

    function handleKeyBinds(command: Command | null): void {
        if (command === "LEFT") {
            questionDispatch({ type: "PREV" });
        }

        if (command === "RIGHT") {
            questionDispatch({ type: "NEXT" });
        }
    }

    useKeyBinds(handleKeyBinds, normal);

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

    return (
        <Box
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
        >
            <Header
                currIndex={questionState.index + 1}
                QuizLength={questions.length}
            />
            {currentCard()}
            <FooterKeybinds />
        </Box>
    );
}
