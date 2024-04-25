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
import { WindowState, Window, WindowProps, useWindow } from "./useWindow.js";
import { WindowControl } from "./useWindow.js";

enum Icons {
    edit = "  ",
    add = "  ",
}

enum Pages {
    quizData = "QUIZ_DATA",
    quiz = "QUIZ",
    section = "SECTION",
    question = "QUESTION",
}

interface PageState {
    page: Pages.quizData | Pages.quiz | Pages.section | Pages.question;
    lastIndex: number[]; // stack of indexes
    allQuizzes: QuizData | null;
    quizFileData: QuizFileData | null;
    section: Section | null;
    question: Question | null;
}

type PageStateActionTypes =
    | "LOAD_QUIZ_DATA"
    | "LOAD_QUIZ"
    | "LOAD_SECTION"
    | "LOAD_QUESTION"
    | "BACK_TO_QUIZ_DATA"
    | "BACK_TO_QUIZ"
    | "BACK_TO_SECTION";

interface PageStateActions {
    type: PageStateActionTypes;
    index: number;
    setCurrIndex: (n: number) => void;
}
function pageReducer(
    pageState: PageState,
    action: PageStateActions,
): PageState {
    const copy: PageState = {
        page: pageState.page,
        lastIndex: pageState.lastIndex,
        allQuizzes: pageState.allQuizzes,
        quizFileData: pageState.quizFileData,
        section: pageState.section,
        question: pageState.question,
    };

    // Right now we are just cloning pointers which is okay, but for changes to
    // be made permanent when making edits parts of the object will need to be
    // deep cloned.  Cloning the entire object is of course of a possiblity, but
    // ideally it would be better to selectively choose which pointers need to be
    // deep cloned
    // const copy: PageState = cloneDeep(pageState);

    switch (action.type) {
        case "LOAD_QUIZ_DATA":
            copy.page = Pages.quizData;
            break;
        case "LOAD_QUIZ":
            copy.page = Pages.quiz;
            copy.quizFileData = copy.allQuizzes!.quizzes[action.index - 1];
            copy.lastIndex.push(action.index);
            action.setCurrIndex(0);
            break;
        case "LOAD_SECTION":
            copy.page = Pages.section;
            copy.section = copy.quizFileData!.quiz.sections[action.index - 1];
            copy.lastIndex.push(action.index);
            action.setCurrIndex(0);
            break;
        case "LOAD_QUESTION":
            copy.page = Pages.question;
            copy.question = copy.section![action.index - 1];
            copy.lastIndex.push(action.index);
            action.setCurrIndex(0);
            break;
        case "BACK_TO_QUIZ_DATA":
            copy.page = Pages.quizData;
            action.setCurrIndex(pageState.lastIndex.pop()!);
            break;
        case "BACK_TO_QUIZ":
            copy.page = Pages.quiz;
            action.setCurrIndex(pageState.lastIndex.pop()!);
            break;
        case "BACK_TO_SECTION":
            copy.page = Pages.section;
            action.setCurrIndex(pageState.lastIndex.pop()!);
            break;
        default:
            throw new Error("Unhandled action type");
    }

    return copy;
}

interface TraverseContextProps {
    pageState: PageState;
    pageDispatch: (action: PageStateActions) => void;
    quizData: QuizData;
    setQuizData: (q: QuizData) => void;
}

export const TraverseContext = createContext<TraverseContextProps | null>(null);

export function CreateNew(): React.ReactElement {
    const [cols, rows] = useStdoutDimensions();
    const [quizData, setQuizData] = useState<QuizData>(initialQuizData);
    const [pageState, pageDispatch] = useReducer(pageReducer, {
        page: Pages.quizData,
        lastIndex: [0],
        allQuizzes: initialQuizData,
        quizFileData: null,
        section: null,
        question: null,
    });
    const { normal, setNormal } = useContext(NormalContext)!;

    const handleInput =
        (size: number, page: Pages) =>
        (currIndex: number, setCurrIndex: (n: number) => void) =>
        (input: string, key: any) => {
            if (key.escape) {
                setNormal(true);
            }

            if (pageState.page !== page || !normal) {
                return;
            }

            if (input === "i") {
                setNormal(false);
            }

            if (input === "j" || key.downArrow) {
                if (currIndex >= size) {
                    return;
                }
                setCurrIndex(currIndex + 1);
            }

            if (input === "k" || key.upArrow) {
                if (currIndex > 0) {
                    setCurrIndex(currIndex - 1);
                }
            }

            if (key.return) {
                let dispatchType: PageStateActionTypes;
                switch (pageState.page) {
                    case Pages.quizData:
                        dispatchType = "LOAD_QUIZ";
                        break;
                    case Pages.quiz:
                        dispatchType = "LOAD_SECTION";
                        break;
                    case Pages.section:
                        dispatchType = "LOAD_QUESTION";
                        break;
                    default:
                        return;
                }

                pageDispatch({
                    type: dispatchType,
                    index: currIndex,
                    setCurrIndex: setCurrIndex,
                });
            }

            if (key.delete) {
                let dispatchType: PageStateActionTypes;
                switch (pageState.page) {
                    case Pages.question:
                        dispatchType = "BACK_TO_SECTION";
                        break;
                    case Pages.section:
                        dispatchType = "BACK_TO_QUIZ";
                        break;
                    case Pages.quiz:
                        dispatchType = "BACK_TO_QUIZ_DATA";
                        break;
                    default:
                        return;
                }

                console.log(dispatchType);

                pageDispatch({
                    type: dispatchType,
                    index: currIndex,
                    setCurrIndex: setCurrIndex,
                });
            }
        };

    let pageContent: React.ReactElement = <></>;
    if (pageState.page === Pages.quizData) {
        pageContent = (
            <List
                data={pageState.allQuizzes!}
                dataType={Pages.quizData}
                handleInput={handleInput(
                    pageState.allQuizzes!.quizzes.length,
                    pageState.page,
                )}
            />
        );
    } else if (pageState.page === Pages.quiz) {
        pageContent = (
            <List
                data={pageState.quizFileData!}
                dataType={Pages.quiz}
                handleInput={handleInput(
                    pageState.quizFileData!.quiz.sections.length,
                    pageState.page,
                )}
            />
        );
    } else if (pageState.page === Pages.section) {
        pageContent = (
            <List
                data={pageState.section!}
                dataType={Pages.section}
                handleInput={handleInput(
                    pageState.section!.questions.length,
                    pageState.page,
                )}
            />
        );
    } else if (pageState.page === Pages.question) {
        pageContent = <></>;
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
    handleInput,
}: {
    data: QuizData | QuizFileData | Section;
    dataType: Pages;
    handleInput: (
        currIndex: number,
        setCurrIndex: (n: number) => void,
    ) => (input: string, key: any) => void;
}): React.ReactElement {
    const { pageState } = useContext(TraverseContext)!;
    const [window, currIndex, setCurrIndex] = useWindow(3);

    let title: string;
    let addText: string;
    let items: QuizFileData[] | Section[] | Question[];
    let getDesc: (index: number) => string;

    if (dataType === Pages.quizData) {
        items = (data as QuizData).quizzes;
        title = "All Quizzes";
        addText = "Add Quiz";
        getDesc = (index: number) => (data as QuizData).quizzes[index].fileName;
    } else if (dataType === Pages.quiz) {
        items = (data as QuizFileData).quiz.sections;
        title = `Sections in: ${pageState.quizFileData?.fileName}`;
        addText = "Add Section";
        getDesc = (index: number) =>
            (data as QuizFileData).quiz.sections[index].name;
    } else if (dataType === Pages.section) {
        items = (data as Section).questions;
        title = `Questions in: ${pageState.quizFileData?.fileName} -> ${pageState.section?.name}`;
        addText = "Add Question";
        getDesc = (index: number) => (data as Section).questions[index].q;
    } else {
        throw new Error("Invalid dataType");
    }

    const useInputCb = handleInput(currIndex, setCurrIndex);
    useInput(useInputCb);

    function mapItems(items: any[]): React.ReactElement[] {
        const components: React.ReactElement[] = [];
        for (let i = -1; i < items.length; ++i) {
            if (i === -1) {
                components.push(
                    <Box
                        borderStyle={currIndex === 0 ? "bold" : "round"}
                        borderColor={currIndex === 0 ? "blue" : ""}
                        flexGrow={1}
                    >
                        <Text>
                            <Text color="green">{Icons.add}</Text>
                            {addText}
                        </Text>
                    </Box>,
                );
            } else {
                components.push(
                    <Box
                        borderStyle={i + 1 === currIndex ? "bold" : "round"}
                        borderColor={i + 1 === currIndex ? "blue" : ""}
                        flexGrow={1}
                    >
                        <Text>
                            <Text color="yellow">{Icons.edit}</Text>
                            {getDesc(i)}
                        </Text>
                    </Box>,
                );
            }
        }
        return components;
    }

    return (
        <>
            <Box alignSelf="center">
                <Text color="yellow" dimColor bold>
                    {title}
                </Text>
            </Box>
            <HorizontalLine />
            <Box flexDirection="row">
                <Box flexDirection="column">
                    <Window
                        items={mapItems(items)}
                        window={window}
                        currIndex={currIndex}
                    />
                </Box>
                <Scroller window={window} length={items.length + 1} />
            </Box>
        </>
    );
}

function Scroller({
    window,
    length,
}: {
    window: WindowControl;
    length: number;
}): React.ReactElement {
    const { windowState, setWindowState } = window;
    const { start, end, mid } = windowState;

    const sGap = start;
    const mGap = end - start - 1;
    const eGap = length - end;

    let sPercent = sGap / length > 0 ? sGap / length : 0;
    let mPercent = mGap / length > 0 ? mGap / length : 0;
    let ePercent = eGap / length > 0 ? eGap / length : 0;

    if (sPercent === 0) {
        ePercent = 1 - mPercent;
    }

    if (ePercent === 0) {
        sPercent = 1 - mPercent;
    }
    <Text>{`${sPercent}, ${mPercent}, ${ePercent}`}</Text>;

    return (
        <>
            <Box flexDirection="column" height="100%">
                <Box flexGrow={sPercent} margin={0}></Box>
                <Box
                    flexGrow={mPercent}
                    borderStyle="round"
                    borderColor="blue"
                ></Box>
                <Box flexGrow={ePercent} margin={0}></Box>
            </Box>
        </>
    );
}

// interface EditContextProps {
//     question: Question;
//     questionCopy: Question;
//     currIndex: number;
// }

// const EditContext = createContext<EditContextProps | null>(null);

// function EditQuestion({
//     question,
// }: {
//     question: Question;
// }): React.ReactElement {
//     const [currIndex, setCurrIndex] = useState<number>(-2);
//     const {
//         pageState,
//         pageDispatch,
//         currItems,
//         setCurrItems,
//         quizData,
//         setQuizData,
//     } = useContext(TraverseContext)!;
//
//     const { normal, setNormal } = useContext(NormalContext)!;
//
//     useInput((input, key) => {
//         if (!normal && key.escape) {
//             setNormal(true);
//         }
//
//         if (pageState.currPage !== "EDIT_QUESTION" || !normal) {
//             return;
//         }
//
//         if (input === "i" && currIndex >= -2) {
//             setNormal(false);
//         }
//
//         if (key.escape) {
//             setNormal(true);
//         }
//
//         if (input === "j" || key.downArrow) {
//             if (currIndex === -2) {
//                 setCurrIndex(0);
//                 return;
//             }
//
//             setCurrIndex(currIndex + 1);
//         }
//
//         if (input === "k" || key.upArrow) {
//             if (currIndex === -1) {
//                 setCurrIndex(-3);
//                 return;
//             }
//             if (currIndex <= -5) {
//                 return;
//             }
//
//             setCurrIndex(currIndex - 1);
//         }
//
//         if (key.delete || (input === "h" && currIndex !== -1)) {
//             pageDispatch({ type: "LOAD_QUESTIONS" });
//             return;
//         }
//
//         if (currIndex === -1 && (input === "h" || key.leftArrow)) {
//             setCurrIndex(-2);
//         }
//         if (currIndex === -2 && (input === "l" || key.rightArrow)) {
//             setCurrIndex(-1);
//         }
//     });
//     return (
//         <>
//             <Box alignSelf="center">
//                 <Text color="yellow" dimColor>
//                     Edit Question
//                 </Text>
//             </Box>
//             <HorizontalLine />
//             <Box flexWrap="wrap">
//                 <QuestionOptions question={question} currIndex={currIndex} />
//                 {(() => {
//                     if (question.type === "qa") {
//                         return (
//                             <EditQA question={question} currIndex={currIndex} />
//                         );
//                     }
//                     if (question.type === "qi") {
//                         return (
//                             <EditQI question={question} currIndex={currIndex} />
//                         );
//                     }
//                     if (question.type === "mc") {
//                         return (
//                             <EditMC question={question} currIndex={currIndex} />
//                         );
//                     }
//                 })()}
//             </Box>
//             <Box width="100%" justifyContent="space-between" marginTop={1}>
//                 <Box borderStyle="round">
//                     <Text>{`${normal ? "--NORMAL--" : "--INSERT--"}`}</Text>
//                 </Box>
//                 <Box>
//                     <Box borderStyle="round">
//                         <Text>Save</Text>
//                     </Box>
//                     <Box borderStyle="round">
//                         <Text>Cancel</Text>
//                     </Box>
//                 </Box>
//             </Box>
//         </>
//     );
// }
//
// function QuestionOptions({
//     question,
//     currIndex,
// }: {
//     question: Question;
//     currIndex: number;
// }): React.ReactElement {
//     type QuestionType = "mc" | "qa" | "qi";
//     function isType(type: QuestionType): boolean {
//         return question.type === type;
//     }
//
//     function isChecked(type: QuestionType): string {
//         return isType(type) ? "[ x ] " : "[   ] ";
//     }
//
//     return (
//         <Box flexDirection="column" borderStyle="round" width="100%">
//             <Box alignItems="center">
//                 <Text color={isType("qa") ? "green" : ""}>
//                     {isChecked("qa")}
//                 </Text>
//                 <Text color={currIndex === -5 ? "blue" : ""}>
//                     Question Answer
//                 </Text>
//             </Box>
//             <Box alignItems="center">
//                 <Text color={isType("qi") ? "green" : ""}>
//                     {isChecked("qi")}
//                 </Text>
//                 <Text color={currIndex === -4 ? "blue" : ""}>
//                     Question Input
//                 </Text>
//             </Box>
//             <Box alignItems="center">
//                 <Text color={isType("mc") ? "green" : ""}>
//                     {isChecked("mc")}
//                 </Text>
//                 <Text color={currIndex === -3 ? "blue" : ""}>
//                     Multiple Choice
//                 </Text>
//             </Box>
//         </Box>
//     );
// }
//
// function Edit({
//     question,
//     currIndex,
// }: {
//     question: Question;
//     currIndex: number;
// }): React.ReactElement {
//     const [questionCopy, setQuestionCopy] = useState<Question>(
//         (() => {
//             return cloneDeep(question);
//         })(),
//     );
//
//     const [questionInput, setQuestionInput] = useState<string>(questionCopy.q);
//     const [answerInput, setAnswerInput] = useState<string>(questionCopy.a);
//
//     const { normal } = useContext(NormalContext)!;
//
//     return (
//         <>
//             <Box
//                 width="50%"
//                 flexDirection="column"
//                 alignItems="center"
//                 borderColor={currIndex === -2 ? "blue" : ""}
//                 borderStyle={currIndex === -2 ? "bold" : "round"}
//             >
//                 <Box>
//                     <Text dimColor>Question: </Text>
//                 </Box>
//                 <HorizontalLine />
//                 <TextInput
//                     value={questionInput}
//                     onChange={setQuestionInput}
//                     focus={!normal && currIndex === -2}
//                 ></TextInput>
//             </Box>
//             <Box
//                 width="50%"
//                 flexDirection="column"
//                 alignItems="center"
//                 borderColor={currIndex === -1 ? "blue" : ""}
//                 borderStyle={currIndex === -1 ? "bold" : "round"}
//             >
//                 <Box>
//                     <Text dimColor>Answer: </Text>
//                 </Box>
//                 <HorizontalLine />
//                 <TextInput
//                     value={answerInput}
//                     onChange={setAnswerInput}
//                     focus={!normal && currIndex === -1}
//                 ></TextInput>
//             </Box>
//         </>
//     );
// }
//
// function EditQA({
//     question,
//     currIndex,
// }: {
//     question: QA;
//     currIndex: number;
// }): React.ReactElement {
//     return <Edit question={question} currIndex={currIndex} />;
// }
//
// function EditQI({
//     question,
//     currIndex,
// }: {
//     question: QI;
//     currIndex: number;
// }): React.ReactElement {
//     return <Edit question={question} currIndex={currIndex} />;
// }
//
// function EditMC({
//     question,
//     currIndex,
// }: {
//     question: MC;
//     currIndex: number;
// }): React.ReactElement {
//     const { normal } = useContext(NormalContext)!;
//
//     return (
//         <>
//             <Edit question={question} currIndex={currIndex} />
//             {question.choices.map((choice, index) => {
//                 const label: string = Object.keys(choice)[0];
//                 const desc: string = choice[label];
//                 return (
//                     <>
//                         <Box width="100%" alignItems="center" key={index}>
//                             <Box>
//                                 <Text
//                                     bold
//                                 >{`${String.fromCharCode(index + 65)}: `}</Text>
//                             </Box>
//                             <Box
//                                 borderColor={index === currIndex ? "blue" : ""}
//                                 borderStyle={
//                                     index === currIndex ? "bold" : "round"
//                                 }
//                                 flexGrow={1}
//                             >
//                                 <MCText
//                                     desc={desc}
//                                     isFocused={index === currIndex && !normal}
//                                 />
//                             </Box>
//                         </Box>
//                     </>
//                 );
//             })}
//             <Box width="100%">
//                 <Text>{"   "}</Text>
//                 <Box borderStyle="round" flexGrow={1}>
//                     <Text color="green">{" + Add Option"}</Text>
//                 </Box>
//             </Box>
//         </>
//     );
// }
//
// function MCText({
//     desc,
//     isFocused,
// }: {
//     desc: string;
//     isFocused: boolean;
// }): React.ReactElement {
//     const [mcInput, setMcInput] = useState<string>(desc);
//     return (
//         <TextInput
//             value={mcInput}
//             onChange={setMcInput}
//             focus={isFocused}
//         ></TextInput>
//     );
// }
