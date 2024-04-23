import React, { useState, useReducer, createContext, useContext } from "react";
import { Box, Text, useInput } from "ink";
import { HorizontalLine } from "../Lines.js";
import { NormalContext } from "../../App.js";
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

enum Icons {
    edit = "  ",
    add = "  ",
}

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
            <Box
                borderStyle={currIndex === 0 ? "bold" : "round"}
                borderColor={currIndex === 0 ? "blue" : ""}
            >
                <Text>
                    <Text color="green">{"  "}</Text>
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
                                    index + 1 === currIndex ? "bold" : "round"
                                }
                                borderColor={
                                    index + 1 === currIndex ? "blue" : ""
                                }
                            >
                                <Text>
                                    <Text color="yellow">{"  "}</Text>
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
            <Box
                borderStyle={currIndex === 0 ? "bold" : "round"}
                borderColor={currIndex === 0 ? "blue" : ""}
            >
                <Text>
                    <Text color="green">{Icons.add}</Text>
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
                                    index + 1 === currIndex ? "bold" : "round"
                                }
                                borderColor={
                                    index + 1 === currIndex ? "blue" : ""
                                }
                            >
                                <Text>
                                    <Text color="yellow">{Icons.edit}</Text>
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
            <Box
                borderStyle={currIndex === 0 ? "bold" : "round"}
                borderColor={currIndex === 0 ? "blue" : ""}
            >
                <Text>
                    <Text color="green">{Icons.add}</Text>
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
                                    index + 1 === currIndex ? "bold" : "round"
                                }
                                borderColor={
                                    index + 1 === currIndex ? "blue" : ""
                                }
                            >
                                <Text>
                                    <Text color="yellow">{Icons.edit}</Text>
                                    {q.q}
                                </Text>
                            </Box>
                        </>
                    );
                })}
        </>
    );
}

interface EditContextProps {
    question: Question;
    questionCopy: Question;
    currIndex: number;
}

const EditContext = createContext<EditContextProps | null>(null);

function EditQuestion({
    question,
}: {
    question: Question;
}): React.ReactElement {
    const [currIndex, setCurrIndex] = useState<number>(-2);
    const {
        pageState,
        pageDispatch,
        currItems,
        setCurrItems,
        allQuizzes,
        setAllQuizzes,
    } = useContext(Context)!;

    const { normal, setNormal } = useContext(NormalContext)!;

    useInput((input, key) => {
        if (!normal && key.escape) {
            setNormal(true);
        }

        if (pageState.currPage !== "EDIT_QUESTION" || !normal) {
            return;
        }

        if (input === "i" && currIndex >= -2) {
            setNormal(false);
        }

        if (key.escape) {
            setNormal(true);
        }

        if (input === "j" || key.downArrow) {
            if (currIndex === -2) {
                setCurrIndex(0);
                return;
            }

            setCurrIndex(currIndex + 1);
        }

        if (input === "k" || key.upArrow) {
            if (currIndex === -1) {
                setCurrIndex(-3);
                return;
            }
            if (currIndex <= -5) {
                return;
            }

            setCurrIndex(currIndex - 1);
        }

        if (key.delete || (input === "h" && currIndex !== -1)) {
            pageDispatch({ type: "LOAD_QUESTIONS" });
            return;
        }

        if (currIndex === -1 && (input === "h" || key.leftArrow)) {
            setCurrIndex(-2);
        }
        if (currIndex === -2 && (input === "l" || key.rightArrow)) {
            setCurrIndex(-1);
        }
    });
    return (
        <>
            <Box alignSelf="center">
                <Text color="yellow" dimColor>
                    Edit Question
                </Text>
            </Box>
            <HorizontalLine />
            <Box flexWrap="wrap">
                <QuestionOptions question={question} currIndex={currIndex} />
                {(() => {
                    if (question.type === "qa") {
                        return (
                            <EditQA question={question} currIndex={currIndex} />
                        );
                    }
                    if (question.type === "qi") {
                        return (
                            <EditQI question={question} currIndex={currIndex} />
                        );
                    }
                    if (question.type === "mc") {
                        return (
                            <EditMC question={question} currIndex={currIndex} />
                        );
                    }
                })()}
            </Box>
            <Box width="100%" justifyContent="space-between" marginTop={1}>
                <Box borderStyle="round">
                    <Text>{`${normal ? "--NORMAL--" : "--INSERT--"}`}</Text>
                </Box>
                <Box>
                    <Box borderStyle="round">
                        <Text>Save</Text>
                    </Box>
                    <Box borderStyle="round">
                        <Text>Cancel</Text>
                    </Box>
                </Box>
            </Box>
        </>
    );
}

function QuestionOptions({
    question,
    currIndex,
}: {
    question: Question;
    currIndex: number;
}): React.ReactElement {
    type QuestionType = "mc" | "qa" | "qi";
    function isType(type: QuestionType): boolean {
        return question.type === type;
    }

    function isChecked(type: QuestionType): string {
        return isType(type) ? "[ x ] " : "[   ] ";
    }

    return (
        <Box flexDirection="column" borderStyle="round" width="100%">
            <Box alignItems="center">
                <Text color={isType("qa") ? "green" : ""}>
                    {isChecked("qa")}
                </Text>
                <Text color={currIndex === -5 ? "blue" : ""}>
                    Question Answer
                </Text>
            </Box>
            <Box alignItems="center">
                <Text color={isType("qi") ? "green" : ""}>
                    {isChecked("qi")}
                </Text>
                <Text color={currIndex === -4 ? "blue" : ""}>
                    Question Input
                </Text>
            </Box>
            <Box alignItems="center">
                <Text color={isType("mc") ? "green" : ""}>
                    {isChecked("mc")}
                </Text>
                <Text color={currIndex === -3 ? "blue" : ""}>
                    Multiple Choice
                </Text>
            </Box>
        </Box>
    );
}

function Edit({
    question,
    currIndex,
}: {
    question: Question;
    currIndex: number;
}): React.ReactElement {
    const [questionCopy, setQuestionCopy] = useState<Question>(
        (() => {
            return cloneDeep(question);
        })(),
    );

    const [questionInput, setQuestionInput] = useState<string>(questionCopy.q);
    const [answerInput, setAnswerInput] = useState<string>(questionCopy.a);

    const { normal } = useContext(NormalContext)!;

    return (
        <>
            <Box
                width="50%"
                flexDirection="column"
                alignItems="center"
                borderColor={currIndex === -2 ? "blue" : ""}
                borderStyle={currIndex === -2 ? "bold" : "round"}
            >
                <Box>
                    <Text dimColor>Question: </Text>
                </Box>
                <HorizontalLine />
                <TextInput
                    value={questionInput}
                    onChange={setQuestionInput}
                    focus={!normal && currIndex === -2}
                ></TextInput>
            </Box>
            <Box
                width="50%"
                flexDirection="column"
                alignItems="center"
                borderColor={currIndex === -1 ? "blue" : ""}
                borderStyle={currIndex === -1 ? "bold" : "round"}
            >
                <Box>
                    <Text dimColor>Answer: </Text>
                </Box>
                <HorizontalLine />
                <TextInput
                    value={answerInput}
                    onChange={setAnswerInput}
                    focus={!normal && currIndex === -1}
                ></TextInput>
            </Box>
        </>
    );
}

function EditQA({
    question,
    currIndex,
}: {
    question: QA;
    currIndex: number;
}): React.ReactElement {
    return <Edit question={question} currIndex={currIndex} />;
}

function EditQI({
    question,
    currIndex,
}: {
    question: QI;
    currIndex: number;
}): React.ReactElement {
    return <Edit question={question} currIndex={currIndex} />;
}

function EditMC({
    question,
    currIndex,
}: {
    question: MC;
    currIndex: number;
}): React.ReactElement {
    const { normal } = useContext(NormalContext)!;

    return (
        <>
            <Edit question={question} currIndex={currIndex} />
            {question.choices.map((choice, index) => {
                const label: string = Object.keys(choice)[0];
                const desc: string = choice[label];
                return (
                    <>
                        <Box width="100%" alignItems="center" key={index}>
                            <Box>
                                <Text
                                    bold
                                >{`${String.fromCharCode(index + 65)}: `}</Text>
                            </Box>
                            <Box
                                borderColor={index === currIndex ? "blue" : ""}
                                borderStyle={
                                    index === currIndex ? "bold" : "round"
                                }
                                flexGrow={1}
                            >
                                <MCText
                                    desc={desc}
                                    isFocused={index === currIndex && !normal}
                                />
                            </Box>
                        </Box>
                    </>
                );
            })}
            <Box width="100%">
                <Text>{"   "}</Text>
                <Box borderStyle="round" flexGrow={1}>
                    <Text color="green">{" + Add Option"}</Text>
                </Box>
            </Box>
        </>
    );
}

function MCText({
    desc,
    isFocused,
}: {
    desc: string;
    isFocused: boolean;
}): React.ReactElement {
    const [mcInput, setMcInput] = useState<string>(desc);
    return (
        <TextInput
            value={mcInput}
            onChange={setMcInput}
            focus={isFocused}
        ></TextInput>
    );
}
