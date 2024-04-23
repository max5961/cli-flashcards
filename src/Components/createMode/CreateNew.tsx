import React, { useState, useReducer, createContext, useContext } from "react";
import { Box, Text, useInput } from "ink";
import { HorizontalLine } from "../Lines.js";
import { NormalContext } from "../../App.js";
import TextInput from "ink-text-input";
import useStdoutDimensions from "../../useStdoutDimensions.js";
import {
    QuizData,
    QuizFileData,
    Quiz,
    Section,
    Question,
    MC,
    QA,
    QI,
} from "../../interfaces.js";
import cloneDeep from "lodash/cloneDeep.js";
import { quizData as initialQuizData } from "./quizData.js";

enum Icons {
    edit = "  ",
    add = "  ",
}

// All Pages are arrays that are part of some parent Object
enum Pages {
    quizzes = "QUIZZES",
    sections = "SECTIONS",
    questions = "QUESTIONS",
    editQuestion = "EDIT_QUESTION",
}

interface PageState {
    currPage:
        | Pages.quizzes
        | Pages.sections
        | Pages.questions
        | Pages.editQuestion;
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
            copy.currPage = Pages.quizzes;
            break;
        case "LOAD_SECTIONS":
            copy.currPage = Pages.sections;
            break;
        case "LOAD_QUESTIONS":
            copy.currPage = Pages.questions;
            break;
        case "LOAD_EDIT_QUESTION":
            copy.currPage = Pages.editQuestion;
            break;
        default:
            throw new Error("Unhandled action type");
    }

    return copy;
}

interface CurrItems {
    quizData: QuizData | null;
    section: Section | null;
    question: Question | null;
}

interface TraverseContextProps {
    pageState: PageState;
    pageDispatch: (action: PageStateActions) => void;
    quizData: QuizData;
    setQuizData: (q: QuizData) => void;
    currItems: CurrItems;
    setCurrItems: (ci: CurrItems) => void;
}

export const TraverseContext = createContext<TraverseContextProps | null>(null);

export function CreateNew(): React.ReactElement {
    const [cols, rows] = useStdoutDimensions();
    const [quizData, setQuizData] = useState<QuizData>(initialQuizData);

    const [currItems, setCurrItems] = useState<CurrItems>({
        quizData: null,
        section: null,
        question: null,
    });

    const [pageState, pageDispatch] = useReducer(pageReducer, {
        currPage: Pages.quizzes,
    });

    let pageContent: React.ReactElement = <></>;
    if (pageState.currPage === Pages.quizzes) {
        // pageContent = <List />;
    } else if (pageState.currPage === Pages.sections) {
        // pageContent = <List />;
    } else if (pageState.currPage === Pages.questions) {
        // pageContent = <List />;
    } else if (pageState.currPage === Pages.editQuestion) {
        // pageContent = <List />;
    } else {
        throw new Error("Invalid pageState");
    }

    return (
        <TraverseContext.Provider
            value={{
                pageState,
                pageDispatch,
                quizData,
                setQuizData,
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
        </TraverseContext.Provider>
    );
}

function List({
    data,
    dataType,
}: {
    data: QuizData | Quiz | Section;
    dataType: Pages;
}): React.ReactElement {
    const { currItems, setCurrItems, currIndex } = useContext(TraverseContext);

    let title: string;
    let addText: string;
    let items: QuizFileData[] | Section[] | Question[];
    let getDesc: (index: number) => string;

    if (dataType === Pages.quizzes) {
        items = (data as QuizData).quizzes;
        title = "All Quizzes";
        addText = "Add Quiz";
        getDesc = (index: number) => (data as QuizData).quizzes[index].fileName;
    } else if (dataType === Pages.sections) {
        items = (data as Quiz).sections;
        title = "Sections";
        addText = "Add Section";
        getDesc = (index: number) => (data as Quiz).sections[index].name;
    } else if (dataType === Pages.questions) {
        items = (data as Section).questions;
        title = "Questions";
        addText = "Add Question";
        getDesc = (index: number) => (data as Section).questions[index].q;
    } else {
        throw new Error("Invalid dataType");
    }

    return (
        <>
            <Box alignSelf="center">
                <Text color="yellow" dimColor bold>
                    {title}
                </Text>
            </Box>
            <HorizontalLine />
            <Box
                borderStyle={currIndex === 0 ? "bold" : "round"}
                borderColor={currIndex === 0 ? "blue" : ""}
            >
                <Text>
                    <Text color="green">{"  "}</Text>
                    {addText}
                </Text>
            </Box>
            {items &&
                items.map((item, index) => {
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
                                    {getDesc(index)}
                                </Text>
                            </Box>
                        </>
                    );
                })}
        </>
    );
}

// function ListQuizzes({
//     quizzes,
// }: {
//     quizzes: QuizFileData[];
// }): React.ReactElement {
//     const [currIndex, setCurrIndex] = useState<number>(0);
//
//     const {
//         pageState,
//         pageDispatch,
//         currItems,
//         setCurrItems,
//         quizData,
//         setQuizData,
//     } = useContext(TraverseContext)!;
//
//     function handleEnter(): void {
//         // ---- set currItems ----
//         // this will work to enter into the next page, but when changes are
//         // made, you must make sure the the quizzes object is cloned with the
//         // changes made to the copy
//         const currItemsCopy = cloneDeep(currItems);
//         currItemsCopy.quizFileData = quizzes[currIndex - 1];
//         setCurrItems(currItemsCopy);
//
//         // Enter the Sections page, which is the Quiz listing different Sections
//         pageDispatch({ type: "LOAD_SECTIONS" });
//     }
//
//     useInput((input, key) => {
//         if (pageState.currPage !== "QUIZZES") {
//             return;
//         }
//
//         if (input === "j" || key.downArrow) {
//             if (currIndex >= quizzes.length) {
//                 return;
//             }
//             setCurrIndex(currIndex + 1);
//         }
//
//         if (input === "k" || key.upArrow) {
//             if (currIndex <= 0) {
//                 return;
//             }
//             setCurrIndex(currIndex - 1);
//         }
//
//         if (key.return || input === "l") {
//             handleEnter();
//         }
//     });
//
//     return (
//         <>
//             <Box alignSelf="center">
//                 <Text color="yellow" dimColor>
//                     All Quizzes
//                 </Text>
//             </Box>
//             <HorizontalLine />
//             <Box
//                 borderStyle={currIndex === 0 ? "bold" : "round"}
//                 borderColor={currIndex === 0 ? "blue" : ""}
//             >
//                 <Text>
//                     <Text color="green">{"  "}</Text>
//                     Add Quiz
//                 </Text>
//             </Box>
//             {quizzes &&
//                 quizzes.map((quiz, index) => {
//                     return (
//                         <>
//                             <Box
//                                 key={index}
//                                 borderStyle={
//                                     index + 1 === currIndex ? "bold" : "round"
//                                 }
//                                 borderColor={
//                                     index + 1 === currIndex ? "blue" : ""
//                                 }
//                             >
//                                 <Text>
//                                     <Text color="yellow">{"  "}</Text>
//                                     {quiz.fileName}
//                                 </Text>
//                             </Box>
//                         </>
//                     );
//                 })}
//         </>
//     );
// }

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
        quizData,
        setQuizData,
    } = useContext(TraverseContext)!;

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
