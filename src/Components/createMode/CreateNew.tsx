import React, { useState, useContext, useEffect, useRef } from "react";
import { Box, Text, useInput } from "ink";
import { HorizontalLine } from "../Lines.js";
import { NormalContext } from "../../App.js";
import TextInput from "ink-text-input";
import { QuizData, Question, QA, MC, QI } from "../../interfaces.js";
import { Window, useWindow } from "./useWindow.js";
import { PageStack, Page, QuestionNav } from "./classes.js";
import { Update } from "./classes.js";

enum Icons {
    edit = "  ",
    add = "  ",
}

export function CurrentPage({
    initialQuizData,
}: {
    initialQuizData: QuizData;
}): React.ReactNode {
    const initialPageStack: PageStack = new PageStack();
    initialPageStack.append(initialQuizData.quizzes, "QUIZZES");

    const [pageStack, setPageStack] = useState<PageStack>(initialPageStack);

    if (pageStack.top()!.pageType === "QUESTION") {
        return (
            <QuestionPage pageStack={pageStack} setPageStack={setPageStack} />
        );
    } else {
        return <List pageStack={pageStack} setPageStack={setPageStack} />;
    }
}

interface ListProps {
    pageStack: PageStack;
    setPageStack: (ps: PageStack) => void;
}
function List({ pageStack, setPageStack }: ListProps): React.ReactNode {
    const { normal, setNormal } = useContext(NormalContext)!;
    const [edit, setEdit] = useState<string>("");
    const { window, currIndex, setCurrIndex } = useWindow(5);
    const [dCount, setDCount] = useState<number>(1);

    const page = pageStack.top()!;

    // update the currIndex to last index on first render
    useEffect(() => {
        setCurrIndex(page.lastIndex);
    }, [pageStack]);

    useInput((input, key) => {
        // !normal
        if (!normal) {
            if (key.return) {
                const update: Update = new Update(
                    currIndex,
                    pageStack,
                    setPageStack,
                );

                if (currIndex === page.listItems!.length) {
                    update.handleAdd(edit);
                } else {
                    update.handleEdit(edit);
                }

                setNormal(true);
            }

            return;
        }

        if (input === "i") {
            if (currIndex < page.listItems!.length) {
                setEdit(page.getDesc!(currIndex));
            } else {
                setEdit("");
            }
            setNormal(false);
        }

        if (key.downArrow || input === "j") {
            if (currIndex < page.listItems!.length) {
                setCurrIndex(currIndex + 1);
            }
        }

        if (key.upArrow || input === "k") {
            if (currIndex > 0) {
                setCurrIndex(currIndex - 1);
            }
        }

        if (input === "d") {
            setDCount(dCount + 1);
            setTimeout(() => {
                setDCount(1);
            }, 500);

            if (dCount === 2) {
                setDCount(0);
                if (currIndex < page.listItems!.length) {
                    const update: Update = new Update(
                        currIndex,
                        pageStack,
                        setPageStack,
                    );
                    update.handleRemove(currIndex);
                }
            }
        }

        if (key.return) {
            // adding new item
            if (currIndex === page.listItems!.length) {
                setNormal(false);
                setEdit("");
                return;
            }

            // enter an already created menu option
            const pageStackCopy = pageStack.shallowClone();
            pageStackCopy.top()!.lastIndex = currIndex;
            pageStackCopy.appendNextPage(currIndex);
            setPageStack(pageStackCopy);
        }

        if (key.delete) {
            const pageStackCopy = pageStack.shallowClone();
            pageStackCopy.pop();
            setPageStack(pageStackCopy);
        }
    });

    function mapItems(items: any[]): React.ReactNode[] {
        const components: React.ReactNode[] = [];

        for (let i = 0; i < items.length; ++i) {
            components.push(
                <Box
                    borderStyle={i === currIndex ? "bold" : "round"}
                    borderColor={i === currIndex ? "blue" : ""}
                    key={i}
                >
                    <Box>
                        <Text color="yellow">{Icons.edit}</Text>
                        {!normal && i === currIndex ? (
                            <TextInput
                                value={edit}
                                onChange={setEdit}
                                focus={!normal && i === currIndex}
                            ></TextInput>
                        ) : (
                            <Text>{page.getDesc!(i)}</Text>
                        )}
                    </Box>
                </Box>,
            );
        }

        // add items
        const i = items.length;
        components.push(
            <Box
                borderStyle={currIndex === i ? "bold" : "round"}
                borderColor={currIndex === i ? "blue" : ""}
                key={i}
            >
                <Text color="green">{Icons.add}</Text>
                {!normal && i === currIndex ? (
                    <TextInput
                        value={edit}
                        onChange={setEdit}
                        focus={!normal && i === currIndex}
                    ></TextInput>
                ) : (
                    <Text>{page.addItemText}</Text>
                )}
            </Box>,
        );

        return components;
    }

    return (
        <>
            <Box justifyContent="space-around" alignItems="center">
                <Text color="yellow" dimColor bold>
                    {page.title}
                </Text>
                <Box borderStyle="round" flexShrink={1}>
                    <Text dimColor>{normal ? "--NORMAL--" : "--INSERT--"}</Text>
                </Box>
            </Box>
            <HorizontalLine />
            <Window
                items={mapItems(page.listItems!)}
                window={window}
                currIndex={currIndex}
                scrollColor="#009293"
                scrollBorder="round"
                scrollMiddle={false}
                scrollPosition="right"
                flexDirection="column"
            />
        </>
    );
}

enum Indexes {
    questionTypeQA = -5,
    questionTypeQI = -4,
    questionTypeMC = -3,
    question = -2,
    answer = -1,
}

interface QuestionPageProps {
    pageStack: PageStack;
    setPageStack: (ps: PageStack) => void;
}
function QuestionPage({
    pageStack,
    setPageStack,
}: QuestionPageProps): React.ReactNode {
    const { normal, setNormal } = useContext(NormalContext)!;

    // set questionCopy state
    const lastPage: Page = pageStack.top()!.prev!;
    const lastIndex = lastPage.lastIndex;
    const question = lastPage.listItems![lastIndex] as Question;
    // Update class doesn't fit very well here but it is needed.  The cloneQuestion
    // function should just be in its own class or separate function
    const update: Update = new Update(0, pageStack, setPageStack);
    const [questionCopy, setQuestionCopy] = useState<Question>(
        update.cloneQuestion(question),
    );

    // set mc choies state
    const initialMcList: any[] =
        questionCopy.type === "mc" ? questionCopy.choices : [];
    const [mcList, setMcList] = useState<any[]>(initialMcList);
    const navRef = useRef<QuestionNav>(new QuestionNav(mcList));
    const [curr, setCurr] = useState<string>(navRef.current.getCurr());
    const [resetNav, setResetNav] = useState<boolean>(false);

    useEffect(() => {
        if (resetNav) {
            navRef.current = new QuestionNav(mcList);
            setResetNav(false);
        }
    }, [resetNav]);

    let questionContent: React.ReactNode;
    if (questionCopy.type === "qa") {
        questionContent = <EditQA question={questionCopy} curr={curr} />;
    } else if (questionCopy.type === "qi") {
        questionContent = <EditQI question={questionCopy} curr={curr} />;
    } else if (questionCopy.type === "mc") {
        questionContent = (
            <EditMC question={questionCopy} curr={curr} mcList={mcList} />
        );
    }

    useInput((input, key) => {
        if (key.return) {
            const curr = navRef.current.getCurr();

            // NOT WORKING
            // reset the question
            const newQuestion = update.cloneQuestion(questionCopy);
            newQuestion.type = curr as "qa" | "qi" | "mc";
            setQuestionCopy(newQuestion);

            // reset the nav
            if (
                (curr === "mc" && question.type !== "mc") ||
                (curr !== "mc" && question.type === "mc")
            ) {
                setResetNav(true);
            }
        }

        if (key.downArrow || input === "j") {
            navRef.current.moveDown();
            setCurr(navRef.current.getCurr());
        }

        if (key.upArrow || input === "k") {
            navRef.current.moveUp();
            setCurr(navRef.current.getCurr());
        }

        if (key.leftArrow || input === "h") {
            navRef.current.moveLeft();
            setCurr(navRef.current.getCurr());
        }

        if (key.rightArrow || input === "l") {
            navRef.current.moveRight();
            setCurr(navRef.current.getCurr());
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
            <Box flexDirection="column" justifyContent="center">
                <QuestionOptions
                    questionCopy={questionCopy}
                    setQuestionCopy={setQuestionCopy}
                    curr={curr}
                />
                {questionContent}
            </Box>
            <Box width="100%" justifyContent="space-between" marginTop={1}>
                <Box borderStyle="round">
                    <Text>{`${normal ? "--NORMAL--" : "--INSERT--"}`}</Text>
                </Box>
                <Box>
                    <Box
                        borderStyle={curr === "save" ? "bold" : "round"}
                        borderColor={curr === "save" ? "blue" : ""}
                    >
                        <Text>Save</Text>
                    </Box>
                    <Box
                        borderStyle={curr === "cancel" ? "bold" : "round"}
                        borderColor={curr === "cancel" ? "blue" : ""}
                    >
                        <Text>Cancel</Text>
                    </Box>
                </Box>
            </Box>
        </>
    );
}

type QuestionType = "mc" | "qa" | "qi";
function QuestionOptions({
    questionCopy,
    setQuestionCopy,
    curr,
}: {
    questionCopy: Question;
    setQuestionCopy: (q: Question) => void;
    curr: string;
}): React.ReactElement {
    function isType(type: QuestionType): boolean {
        return questionCopy.type === type;
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
                <Text color={curr === "qa" ? "blue" : ""}>Question Answer</Text>
            </Box>
            <Box alignItems="center">
                <Text color={isType("qi") ? "green" : ""}>
                    {isChecked("qi")}
                </Text>
                <Text color={curr === "qi" ? "blue" : ""}>Question Input</Text>
            </Box>
            <Box alignItems="center">
                <Text color={isType("mc") ? "green" : ""}>
                    {isChecked("mc")}
                </Text>
                <Text color={curr === "mc" ? "blue" : ""}>Multiple Choice</Text>
            </Box>
        </Box>
    );
}

function Edit({
    question,
    curr,
}: {
    question: Question;
    curr: string;
}): React.ReactElement {
    const [questionInput, setQuestionInput] = useState<string>(question.q);
    const [answerInput, setAnswerInput] = useState<string>(question.a);

    const { normal } = useContext(NormalContext)!;

    return (
        <>
            <Box width="100%" justifyContent="space-around" gap={-1}>
                <Box
                    width="50%"
                    flexDirection="column"
                    alignItems="center"
                    borderColor={curr === "q" ? "blue" : ""}
                    borderStyle={curr === "q" ? "bold" : "round"}
                >
                    <Box>
                        <Text dimColor>Question: </Text>
                    </Box>
                    <HorizontalLine />
                    <TextInput
                        value={questionInput}
                        onChange={setQuestionInput}
                        focus={!normal && curr === "q"}
                    ></TextInput>
                </Box>
                <Box
                    width="50%"
                    flexDirection="column"
                    alignItems="center"
                    borderColor={curr === "a" ? "blue" : ""}
                    borderStyle={curr === "a" ? "bold" : "round"}
                >
                    <Box>
                        <Text dimColor>Answer: </Text>
                    </Box>
                    <HorizontalLine />
                    <TextInput
                        value={answerInput}
                        onChange={setAnswerInput}
                        focus={!normal && curr === "a"}
                    ></TextInput>
                </Box>
            </Box>
        </>
    );
}

function EditQA({
    question,
    curr,
}: {
    question: QA;
    curr: string;
}): React.ReactElement {
    return <Edit question={question} curr={curr} />;
}

function EditQI({
    question,
    curr,
}: {
    question: QI;
    curr: string;
}): React.ReactElement {
    return <Edit question={question} curr={curr} />;
}

function EditMC({
    question,
    curr,
    mcList,
}: {
    question: MC;
    curr: string;
    mcList: any[];
}): React.ReactElement {
    const { normal } = useContext(NormalContext)!;

    return (
        <>
            <Edit question={question} curr={curr} />
            {mcList.map((choice, index) => {
                const getLabel = (i: number): string =>
                    String.fromCharCode(65 + i);

                const desc: string = choice[getLabel(index)];

                return (
                    <>
                        <Box width="100%" alignItems="center" key={index}>
                            <Box>
                                <Text bold>{`${getLabel(index)}: `}</Text>
                            </Box>
                            <Box
                                borderColor={
                                    curr === getLabel(index) ? "blue" : ""
                                }
                                borderStyle={
                                    curr === getLabel(index) ? "bold" : "round"
                                }
                                flexGrow={1}
                            >
                                <MCText
                                    desc={desc}
                                    isFocused={
                                        !normal && curr === getLabel(index)
                                    }
                                />
                            </Box>
                        </Box>
                    </>
                );
            })}
            <Box width="100%">
                <Text>{"   "}</Text>
                <Box
                    flexGrow={1}
                    borderColor={curr === "add" ? "blue" : ""}
                    borderStyle={curr === "add" ? "bold" : "round"}
                >
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
