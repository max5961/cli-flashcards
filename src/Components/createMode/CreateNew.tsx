import React, { useState, useContext, createContext, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { HorizontalLine } from "../Lines.js";
import { NormalContext } from "../../App.js";
import TextInput from "ink-text-input";
import useStdoutDimensions from "../../useStdoutDimensions.js";
import {
    QuizData,
    QuizFileData,
    Section,
    Question,
    Quiz,
} from "../../interfaces.js";
import cloneDeep from "lodash/cloneDeep.js";
import { quizData as initialQuizData } from "./quizData.js";
import { WindowState, Window, WindowProps, useWindow } from "./useWindow.js";
import { WindowControl } from "./useWindow.js";
import { writeFile } from "fs/promises";
import { readdirSync, unlinkSync } from "fs";
import path from "path";
import os from "os";

enum Icons {
    edit = "  ",
    add = "  ",
}

export function CreateMenu({
    initialQuizData,
}: {
    initialQuizData: QuizData;
}): React.ReactElement {
    // this should be in its own component in App
    const [cols, rows] = useStdoutDimensions();
    return (
        <Box
            height={rows}
            width={cols}
            alignItems="center"
            justifyContent="center"
        >
            <Box width={75} flexDirection="column" borderStyle="round">
                <Page initialQuizData={initialQuizData} />
            </Box>
        </Box>
    );
}

type Page = QuizData | QuizFileData | Section | Question;
type PageStack = { page: Page; lastIndex: number }[];
type ListItems = QuizFileData[] | Section[] | Question[];
interface PageContextProps {
    // for building list
    listItems: ListItems | null;
    title: string | null;
    addItemText: string | null;
    getDesc: ((index: number) => string) | null;

    // for traversing pages
    pageStack: PageStack | null;
    setPageStack: ((ps: PageStack) => void) | null;
    getNextPages: ((n: number) => Page)[];
}

const PageContext = createContext<PageContextProps | null>(null);

function Page({
    initialQuizData,
}: {
    initialQuizData: QuizData;
}): React.ReactNode {
    // never ended up using setQuizData
    const [quizData, setQuizData] = useState<QuizData>(initialQuizData);

    const [pageStack, setPageStack] = useState<PageStack>([
        { page: quizData, lastIndex: 0 },
    ]);

    const getNextPages: ((n: number) => Page)[] = [
        (currIndex: number) =>
            (pageStack[0]!.page as QuizData).quizzes[currIndex - 1],
        (currIndex: number) =>
            (pageStack[1]!.page as QuizFileData).quiz.sections[currIndex - 1],
        (currIndex: number) =>
            (pageStack[2]!.page as Section).questions[currIndex - 1],
    ];

    let listItems: ListItems | null = null;
    let title: string | null = null;
    let addItemText: string | null = null;
    let getDesc: ((index: number) => string) | null = null;

    // All Quizzes
    if (pageStack.length === 1) {
        const quizzes = (pageStack[0].page as QuizData).quizzes;
        listItems = quizzes;
        title = "All Quizzes";
        addItemText = "Add Quiz";
        getDesc = (index: number) => quizzes[index].fileName;

        // Sections in chosen Quiz
    } else if (pageStack.length === 2) {
        const quizFileData = pageStack[1].page as QuizFileData;
        listItems = quizFileData.quiz.sections;
        title = `Sections in: ${quizFileData.fileName}`;
        addItemText = "Add Section";
        getDesc = (index: number) => quizFileData.quiz.sections[index].name;

        // Questions in chosen Section
    } else if (pageStack.length === 3) {
        const section = pageStack[2].page as Section;
        listItems = section.questions;
        addItemText = "Add Question";
        title = `Questions in: ${(pageStack[1].page as QuizFileData).fileName} -> ${section.name}`;
        getDesc = (index: number) => section.questions[index].q;

        // Don't need to set any values for the Question page
    } else if (pageStack.length !== 4) {
        throw new Error("Invalid pageStack index");
    }

    return (
        <PageContext.Provider
            value={{
                listItems: listItems,
                title: title,
                addItemText: addItemText,
                getDesc: getDesc,
                pageStack: pageStack,
                setPageStack: setPageStack,
                getNextPages: getNextPages,
            }}
        >
            {pageStack.length === 4 ? <QuestionPage /> : <List />}
        </PageContext.Provider>
    );
}

function List(): React.ReactNode {
    const {
        listItems,
        title,
        addItemText,
        getDesc,
        pageStack,
        setPageStack,
        getNextPages,
    } = useContext(PageContext)!;

    const { normal, setNormal } = useContext(NormalContext)!;

    const windowSize = 6;
    const [window, currIndex, setCurrIndex] = useWindow(windowSize);
    const [edit, setEdit] = useState<string>("");

    useEffect(() => {
        if (currIndex > 0) {
            setEdit(getDesc!(currIndex - 1));
        }
    }, [currIndex]);

    useEffect(() => {
        const lastIndex = pageStack![pageStack!.length - 1].lastIndex;
        setCurrIndex(lastIndex);
        if (lastIndex > 0) {
            setEdit(getDesc!(lastIndex - 1));
        }
    }, [pageStack]);

    async function handleChanges(): Promise<void> {
        // get file info
        const pageStackCopy = cloneDeep(pageStack!);
        let itemsCopy: ListItems;
        if (pageStack!.length === 1) {
            itemsCopy = (pageStack![0].page as QuizData).quizzes.slice();
            itemsCopy[currIndex - 1].fileName = edit;
            (pageStackCopy![0].page as QuizData).quizzes = cloneDeep(itemsCopy);
        } else if (pageStack!.length === 2) {
            itemsCopy = (
                pageStack![1].page as QuizFileData
            ).quiz.sections.slice();
            itemsCopy[currIndex - 1].name = edit;
            (pageStackCopy![1].page as QuizFileData).quiz.sections =
                cloneDeep(itemsCopy);
        } else if (pageStack!.length === 3) {
            itemsCopy = (pageStack![2].page as Section).questions.slice();
            itemsCopy[currIndex - 1].q = edit;
            (pageStackCopy[2].page as Section).questions = cloneDeep(itemsCopy);
        } else {
            throw new Error("Unhandled page");
        }

        try {
            const dir = path.join(
                os.homedir(),
                ".local",
                "share",
                "flashcards",
            );
            const files: string[] = readdirSync(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                unlinkSync(filePath);
            }
        } catch (err: any) {
            console.error(err.message);
        }

        for (const quiz of (pageStackCopy[0].page as QuizData).quizzes) {
            const json = JSON.stringify(quiz, null, 4);
            const fileName = quiz.fileName;
            const filePath = path.join(
                os.homedir(),
                ".local",
                "share",
                "flashcards",
                fileName,
            );
            await writeFile(filePath, json, "utf-8");
        }

        // cleanup
        pageStackCopy[pageStackCopy.length - 1].lastIndex = currIndex;
        setNormal(true);
        setPageStack!(pageStackCopy);
    }

    useInput((input, key) => {
        if (!normal && (key.return || key.escape)) {
            setNormal(true);
            handleChanges();
        }

        if (!normal) {
            return;
        }

        if (input === "i") {
            setNormal(false);
        }

        if (key.downArrow || input === "j") {
            if (currIndex >= listItems!.length) {
                return;
            }
            setCurrIndex(currIndex + 1);
        }

        if (key.downArrow || input === "k") {
            if (currIndex > 0) {
                setCurrIndex(currIndex - 1);
            }
        }

        if (input === "c") {
            setNormal(false);
            setEdit("");
        }

        if (key.return) {
            // copy pageStack and modify lastIndex of current page to be currIndex
            const pageStackCopy = pageStack!.slice();
            pageStackCopy[pageStackCopy.length - 1].lastIndex = currIndex;

            // push next page and update state
            const getNextPage = getNextPages[pageStack!.length - 1];
            const nextPage = getNextPage(currIndex);
            pageStackCopy.push({ page: nextPage, lastIndex: 0 });
            setPageStack!(pageStackCopy);
        }

        if (key.delete) {
            // we are at the start page already
            if (pageStack!.length === 1) {
                return;
            }

            const pageStackCopy = pageStack!.slice();
            pageStackCopy.pop();
            setPageStack!(pageStackCopy);
        }
    });

    function mapItems(items: any[]): React.ReactNode[] {
        const components: React.ReactNode[] = [];
        for (let i = -1; i < items.length; ++i) {
            if (i === -1) {
                components.push(
                    <Box
                        borderStyle={currIndex === 0 ? "bold" : "round"}
                        borderColor={currIndex === 0 ? "blue" : ""}
                    >
                        <Text>
                            <Text color="green">{Icons.add}</Text>
                            {addItemText}
                        </Text>
                    </Box>,
                );
            } else {
                components.push(
                    <Box
                        borderStyle={i + 1 === currIndex ? "bold" : "round"}
                        borderColor={i + 1 === currIndex ? "blue" : ""}
                    >
                        <Box>
                            <Text color="yellow">{Icons.edit}</Text>
                            {!normal && i + 1 === currIndex ? (
                                <TextInput
                                    value={edit}
                                    onChange={setEdit}
                                    focus={!normal && i + 1 === currIndex}
                                ></TextInput>
                            ) : (
                                <Text>{getDesc!(i)}</Text>
                            )}
                        </Box>
                    </Box>,
                );
            }
        }
        return components;
    }

    return (
        <>
            <Box justifyContent="space-around" alignItems="center">
                <Text color="yellow" dimColor bold>
                    {title}
                </Text>
                <Box borderStyle="round" flexShrink={1}>
                    <Text dimColor>{normal ? "--NORMAL--" : "--INSERT--"}</Text>
                </Box>
            </Box>
            <HorizontalLine />
            <Window
                items={mapItems(listItems!)}
                window={window}
                currIndex={currIndex}
                scrollColor="white"
                scrollBorder="single"
                scrollMiddle={false}
                scrollPosition="right"
                flexDirection="column"
            />
        </>
    );
}

function QuestionPage(): React.ReactNode {
    return <></>;
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
