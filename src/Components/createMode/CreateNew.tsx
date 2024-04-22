import React, { useState, useReducer, createContext, useContext } from "react";
import { Box, Text, useInput } from "ink";
import { HorizontalLine } from "../Lines.js";
import TextInput from "ink-text-input";
import useStdoutDimensions from "../../useStdoutDimensions.js";
import {
    Question,
    QuizFileData,
    Section,
    MC,
    QA,
    QI,
} from "../../interfaces.js";
import { quizzes } from "./quizzes.js";
import cloneDeep from "lodash/cloneDeep.js";

interface PageState {
    currPage: "QUIZZES" | "SECTIONS" | "QUESTIONS" | "EDIT_QUESTION";
}
interface PageStateActions {
    type:
        | "LOAD_QUIZZES"
        | "LOAD_SECTIONS"
        | "LOAD_QUESTIONS"
        | "LOAD_EDIT_QUESTION";
}
function pageReducer(
    pageState: PageState,
    action: PageStateActions,
): PageState {
    const copy: PageState = {
        currPage: pageState.currPage,
    };

    switch (action.type) {
        case "LOAD_QUIZZES":
            copy.currPage = "QUIZZES";
            break;
        case "LOAD_SECTIONS":
            copy.currPage = "SECTIONS";
            break;
        case "LOAD_QUESTIONS":
            copy.currPage = "QUESTIONS";
            break;
        case "LOAD_EDIT_QUESTION":
            copy.currPage = "EDIT_QUESTION";
            break;
        default:
            throw new Error("Unhandled action type");
    }

    return copy;
}

interface CurrItems {
    quizFileData: QuizFileData | null;
    section: Section | null;
    question: (MC | QA | QI) | null;
}

interface State {
    pageState: PageState;
    pageDispatch: (action: PageStateActions) => void;
    allQuizzes: QuizFileData[];
    setAllQuizzes: (q: QuizFileData[]) => void;
    currItems: CurrItems;
    setCurrItems: (ci: CurrItems) => void;
}

export const Context = createContext<State | null>(null);

export function CreateNew(): React.ReactElement {
    const [cols, rows] = useStdoutDimensions();
    const [allQuizzes, setAllQuizzes] = useState<QuizFileData[]>(quizzes);

    const [currItems, setCurrItems] = useState<CurrItems>({
        quizFileData: null,
        section: null,
        question: null,
    });

    const [pageState, pageDispatch] = useReducer(pageReducer, {
        currPage: "QUIZZES",
    });

    let pageContent: React.ReactElement;
    if (pageState.currPage === "QUIZZES") {
        pageContent = <ListQuizzes quizzes={allQuizzes} />;
    } else if (pageState.currPage === "SECTIONS") {
        pageContent = <ListSections quizFileData={currItems.quizFileData!} />;
    } else if (pageState.currPage === "QUESTIONS") {
        pageContent = <ListQuestions section={currItems.section!} />;
    } else if (pageState.currPage === "EDIT_QUESTION") {
        pageContent = <EditQuestion question={currItems.question!} />;
    } else {
        throw new Error("Invalid pageState");
    }

    return (
        <Context.Provider
            value={{
                pageState,
                pageDispatch,
                allQuizzes,
                setAllQuizzes,
                currItems,
                setCurrItems,
            }}
        >
            <Box
                height={rows}
                width={cols}
                alignItems="center"
                justifyContent="center"
            >
                <Box width={50} flexDirection="column" borderStyle="round">
                    {pageContent}
                </Box>
            </Box>
        </Context.Provider>
    );
}

function ListQuizzes({
    quizzes,
}: {
    quizzes: QuizFileData[];
}): React.ReactElement {
    const [currIndex, setCurrIndex] = useState<number>(0);

    const {
        pageState,
        pageDispatch,
        currItems,
        setCurrItems,
        allQuizzes,
        setAllQuizzes,
    } = useContext(Context)!;

    function handleEnter(): void {
        // ---- set currItems ----
        // this will work to enter into the next page, but when changes are
        // made, you must make sure the the quizzes object is cloned with the
        // changes made to the copy
        const currItemsCopy = cloneDeep(currItems);
        currItemsCopy.quizFileData = quizzes[currIndex - 1];
        setCurrItems(currItemsCopy);

        // Enter the Sections page, which is the Quiz listing different Sections
        pageDispatch({ type: "LOAD_SECTIONS" });
    }

    useInput((input, key) => {
        if (pageState.currPage !== "QUIZZES") {
            return;
        }

        if (input === "j" || key.downArrow) {
            if (currIndex >= quizzes.length) {
                return;
            }
            setCurrIndex(currIndex + 1);
        }

        if (input === "k" || key.upArrow) {
            if (currIndex <= 0) {
                return;
            }
            setCurrIndex(currIndex - 1);
        }

        if (key.return || input === "l") {
            handleEnter();
        }
    });

    return (
        <>
            <Box alignSelf="center">
                <Text color="yellow" dimColor>
                    All Quizzes
                </Text>
            </Box>
            <HorizontalLine />
            <Box borderStyle={currIndex === 0 ? "classic" : "round"}>
                <Text inverse={currIndex === 0}>
                    <Text color="green" inverse={currIndex === 0}>
                        {" [+] "}
                    </Text>
                    Add Quiz
                </Text>
            </Box>
            {quizzes &&
                quizzes.map((quiz, index) => {
                    return (
                        <>
                            <Box
                                key={index}
                                borderStyle={
                                    index + 1 === currIndex
                                        ? "classic"
                                        : "round"
                                }
                            >
                                <Text inverse={index + 1 === currIndex}>
                                    <Text color="yellow">{" [E] "}</Text>
                                    {quiz.fileName}
                                </Text>
                            </Box>
                        </>
                    );
                })}
        </>
    );
}

function ListSections({
    quizFileData,
}: {
    quizFileData: QuizFileData;
}): React.ReactElement {
    const [currIndex, setCurrIndex] = useState<number>(0);

    const {
        pageState,
        pageDispatch,
        currItems,
        setCurrItems,
        allQuizzes,
        setAllQuizzes,
    } = useContext(Context)!;

    function handleEnter(): void {
        // ---- set currItems ----
        // this will work to enter into the next page, but when changes are
        // made, you must make sure the the quizzes object is cloned with the
        // changes made to the copy
        const copyCurrItems = cloneDeep(currItems);
        copyCurrItems.section = quizFileData.quiz.sections[currIndex - 1];
        setCurrItems(copyCurrItems);

        // Enter the Sections page, which is the Quiz listing different Sections
        pageDispatch({ type: "LOAD_QUESTIONS" });
    }

    useInput((input, key) => {
        if (pageState.currPage !== "SECTIONS") {
            return;
        }

        if (input === "j" || key.downArrow) {
            if (currIndex >= quizFileData.quiz.sections.length) {
                return;
            }
            setCurrIndex(currIndex + 1);
        }

        if (input === "k" || key.upArrow) {
            if (currIndex <= 0) {
                return;
            }
            setCurrIndex(currIndex - 1);
        }

        if (key.return || input === "l") {
            handleEnter();
        }

        if (key.delete || input === "h") {
            pageDispatch({ type: "LOAD_QUIZZES" });
        }
    });

    return (
        <>
            <Box alignSelf="center">
                <Text color="yellow" dimColor>
                    {currItems.quizFileData!.fileName}
                </Text>
            </Box>
            <HorizontalLine />
            <Box borderStyle={currIndex === 0 ? "classic" : "round"}>
                <Text inverse={currIndex === 0}>
                    <Text color="green" inverse={currIndex === 0}>
                        {" [+] "}
                    </Text>
                    Add Section
                </Text>
            </Box>
            {quizFileData.quiz.sections &&
                quizFileData.quiz.sections.map((section, index) => {
                    return (
                        <>
                            <Box
                                key={index}
                                borderStyle={
                                    index + 1 === currIndex
                                        ? "classic"
                                        : "round"
                                }
                            >
                                <Text inverse={index + 1 === currIndex}>
                                    <Text color="yellow">{" [E] "}</Text>
                                    {section.name}
                                </Text>
                            </Box>
                        </>
                    );
                })}
        </>
    );
}

function ListQuestions({ section }: { section: Section }): React.ReactElement {
    const [currIndex, setCurrIndex] = useState<number>(0);

    const {
        pageState,
        pageDispatch,
        currItems,
        setCurrItems,
        allQuizzes,
        setAllQuizzes,
    } = useContext(Context)!;

    function handleEnter(): void {
        // ---- set currItems ----
        // this will work to enter into the next page, but when changes are
        // made, you must make sure the the quizzes object is cloned with the
        // changes made to the copy
        const copyCurrItems = cloneDeep(currItems);
        copyCurrItems.question = section.questions[currIndex - 1];
        setCurrItems(copyCurrItems);

        // Enter the Sections page, which is the Quiz listing different Sections
        pageDispatch({ type: "LOAD_EDIT_QUESTION" });
    }

    function handleBackspace(): void {
        pageDispatch({ type: "LOAD_SECTIONS" });
    }

    useInput((input, key) => {
        if (pageState.currPage !== "QUESTIONS") {
            return;
        }

        if (input === "j" || key.downArrow) {
            if (currIndex >= section.questions.length) {
                return;
            }
            setCurrIndex(currIndex + 1);
        }

        if (input === "k" || key.upArrow) {
            if (currIndex <= 0) {
                return;
            }
            setCurrIndex(currIndex - 1);
        }

        if (key.return || input === "l") {
            handleEnter();
        }

        if (key.delete || input === "h") {
            pageDispatch({ type: "LOAD_SECTIONS" });
        }
    });

    return (
        <>
            <Box alignSelf="center">
                <Text color="yellow" dimColor>
                    {`${currItems.quizFileData!.fileName} -> ${currItems.section!.name}`}
                </Text>
            </Box>
            <HorizontalLine />
            <Box borderStyle={currIndex === 0 ? "classic" : "round"}>
                <Text inverse={currIndex === 0}>
                    <Text color="green" inverse={currIndex === 0}>
                        {" [+] "}
                    </Text>
                    Add Question
                </Text>
            </Box>
            {section &&
                section.questions.map((q, index) => {
                    return (
                        <>
                            <Box
                                key={index}
                                borderStyle={
                                    index + 1 === currIndex
                                        ? "classic"
                                        : "round"
                                }
                            >
                                <Text inverse={index + 1 === currIndex}>
                                    <Text color="yellow">{" [E] "}</Text>
                                    {q.q}
                                </Text>
                            </Box>
                        </>
                    );
                })}
        </>
    );
}

function EditQuestion({
    question,
}: {
    question: Question;
}): React.ReactElement {
    return (
        <>
            <Box alignSelf="center">
                <Text color="yellow" dimColor>
                    Edit Question
                </Text>
            </Box>
            <HorizontalLine />
            {(() => {
                if (question.type === "qa") {
                    return <EditQA question={question} />;
                }
                if (question.type === "qi") {
                    return <EditQI question={question} />;
                }
                if (question.type === "mc") {
                    return <EditMC question={question} />;
                }
            })()}
        </>
    );
}

function EditQA({ question }: { question: Question }): React.ReactElement {
    return <></>;
}
function EditQI({ question }: { question: Question }): React.ReactElement {
    return <></>;
}
function EditMC({ question }: { question: Question }): React.ReactElement {
    return <></>;
}
