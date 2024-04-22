import React, { useState, useReducer, createContext, useContext } from "react";
import { Box, Text, useInput } from "ink";
import { HorizontalLine } from "../Lines.js";
import TextInput from "ink-text-input";
import useStdoutDimensions from "../../useStdoutDimensions.js";
import { ListQuizzes } from "./ListQuizzes.js";
import {
    Questions,
    QuizFileData,
    Section,
    MC,
    QA,
    QI,
} from "../../interfaces.js";

const quizzes: QuizFileData[] = [
    {
        fileName: "my-quiz",
        quiz: {
            sections: [
                {
                    name: "Promises",
                    questions: [
                        {
                            type: "qi",
                            q: "What is my first name?",
                            a: "Ma",
                        },
                        {
                            type: "qa",
                            q: "How many Promise static methods are there?",
                            a: "6",
                        },
                        {
                            type: "mc",
                            q: "What does Promise.resolve do?",
                            a: "C",
                            choices: [
                                {
                                    A: "Wraps its input argument in a Promise and immediately rejects it",
                                },
                                {
                                    B: "Waits until all Promises in an array are resolved",
                                },
                                {
                                    C: "Wraps its input argument in a Promise and immediately resolves it",
                                },
                                { D: "Does nothing" },
                            ],
                        },
                        {
                            type: "mc",
                            q: "Which of these Promise static methods are 'all or nothing'",
                            a: "A",
                            choices: [
                                {
                                    A: "Promise.all",
                                },
                                {
                                    B: "Promise.allSettled",
                                },
                                {
                                    C: "Promise.race",
                                },
                                {
                                    D: "Promise.any",
                                },
                            ],
                        },
                        {
                            type: "mc",
                            q: "What are Promises?",
                            a: "D",
                            choices: [
                                {
                                    A: "Promises are BRODUDE",
                                },
                                {
                                    B: "Promise are possibly BRODUDE",
                                },
                                {
                                    C: "Promises are not BRODUDE",
                                },
                                {
                                    D: "Promises are objects which represent the state of some task",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    },
];

interface PageState {
    currPage:
        | "list quizzes"
        | "list sections"
        | "list questions"
        | "edit quiz"
        | "edit section"
        | "edit question";
}
interface PageStateActions {
    type: "PLACEHOLDER";
}
function pageReducer(
    pageState: PageState,
    action: PageStateActions,
): PageState {
    //
}

interface ItemState {
    currQuiz: Questions | null;
    currSection: Section | null;
    currQuestion: MC | QA | QI | null;
}
interface ItemStateActions {
    type: "PLACEHOLDER";
}
function itemReducer(
    itemState: ItemState,
    action: ItemStateActions,
): ItemState {
    if (action.type === "PLACEHOLDER") {
        return {
            currQuiz: itemState.currQuiz,
            currSection: itemState.currSection,
            currQuestion: itemState.currQuestion,
        };
    } else {
        return {
            currQuiz: itemState.currQuiz,
            currSection: itemState.currSection,
            currQuestion: itemState.currQuestion,
        };
    }
}

interface State {
    itemState: ItemState;
    itemDispatch: (action: ItemStateActions) => void;
    pageState: PageState;
    pageDispatch: (action: PageStateActions) => void;
}
const Context = createContext<State | null>(null);

export function CreateNew(): React.ReactElement {
    const [cols, rows] = useStdoutDimensions();

    const [itemState, itemDispatch] = useReducer(itemReducer, {
        currQuiz: null,
        currSection: null,
        currQuestion: null,
    });

    const [pageState, pageDispatch] = useReducer(pageReducer, {
        currPage: "list quizzes",
    });

    return (
        <Context.Provider
            value={{
                itemState,
                itemDispatch,
                pageState,
                pageDispatch,
            }}
        >
            <Box
                height={rows}
                width={cols}
                alignItems="center"
                justifyContent="center"
            >
                <Box width={50} flexDirection="column" borderStyle="round">
                    <ListQuizzes quizzes={quizzes} />
                </Box>
            </Box>
        </Context.Provider>
    );
}
