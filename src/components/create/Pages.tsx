import React, {
    useState,
    useContext,
    useEffect,
    createContext,
    useRef,
} from "react";
import { Box, Text, useInput } from "ink";
import { HorizontalLine } from "../Lines.js";
import { NormalContext } from "../../App.js";
import TextInput from "ink-text-input";
import { Quiz, Question, QuestionData } from "../../types.js";
import { Window, useWindow } from "../../hooks/useWindow.js";
import {
    PageStack,
    Page,
    ListPage,
    QuestionPage,
} from "../../utils/PageStack.js";
import { Nav } from "../../utils/Nav.js";
import { QUtils, QBoxNode } from "../../utils/QUtils.js";
import Update from "../../utils/Write.js";

enum Icons {
    edit = "  ",
    add = "  ",
}

export function CurrentPageView({
    initialQuizzes,
}: {
    initialQuizzes: Quiz[];
}): React.ReactNode {
    const initialPageStack: PageStack = new PageStack();
    initialPageStack.append("QUIZZES", initialQuizzes);

    const [pageStack, setPageStack] = useState<PageStack>(initialPageStack);

    const page: Page = pageStack.top()!;
    if (page.pageType === "QUESTION") {
        return (
            <QuestionPage pageStack={pageStack} setPageStack={setPageStack} />
        );
    } else {
        return (
            <ListPageView pageStack={pageStack} setPageStack={setPageStack} />
        );
    }
}

interface ListProps {
    pageStack: PageStack;
    setPageStack: (ps: PageStack) => void;
}
function ListPageView({ pageStack, setPageStack }: ListProps): React.ReactNode {
    const { normal, setNormal } = useContext(NormalContext)!;
    const [edit, setEdit] = useState<string>("");
    const { window, currIndex, setCurrIndex } = useWindow(5);
    const [dCount, setDCount] = useState<number>(1);

    const page: ListPage = pageStack.top()! as ListPage;

    // update the currIndex to last index on first render
    useEffect(() => {
        setCurrIndex(page.lastIndex);
    }, [pageStack]);

    useInput((input, key) => {
        // !normal
        if (!normal) {
            if (key.return) {
                const update: Update = new Update(pageStack, setPageStack);

                if (currIndex === page.listItems!.length) {
                    update.handleAdd(edit);
                } else {
                    update.handleEdit(edit, currIndex);
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
                    const update: Update = new Update(pageStack, setPageStack);
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

interface QuestionPageContext {
    pageStack: PageStack;
    setPageStack: (ps: PageStack) => void;
    questionData: QuestionData;
    setQuestionData: (qd: QuestionData) => void;
    nav: Nav<QBoxNode>;
    setNav: (n: Nav<QBoxNode>) => void;
    curr: QBoxNode;
    setCurr: (o: QBoxNode) => void;
}

const QuestionPageContext = createContext<QuestionPageContext | null>(null);

interface QuestionPageProps {
    pageStack: PageStack;
    setPageStack: (ps: PageStack) => void;
}
function QuestionPageView({
    pageStack,
    setPageStack,
}: QuestionPageProps): React.ReactNode {
    const lastPage: Page = pageStack.top()!.prev!;
    const lastIndex = lastPage.lastIndex;
    const question: Question = lastPage.listItems![lastIndex] as Question;
    const initialQuestionData = QUtils.toQuestionData(question);

    const initialData = useRef<QuestionData>(
        QUtils.cloneQuestionData(initialQuestionData),
    );

    // normal context
    const { normal, setNormal } = useContext(NormalContext)!;

    // questionData state
    const [questionData, setQuestionData] = useState<QuestionData>(
        QUtils.cloneQuestionData(initialQuestionData),
    );

    // nav state
    const navInitializer = QUtils.getNavInitializer(questionData);
    const [nav, setNav] = useState<Nav<QBoxNode>>(
        new Nav<QBoxNode>(navInitializer),
    );

    // curr node state
    const [curr, setCurr] = useState<QBoxNode>(nav.getCurr());

    function setState(type: "qa" | "qi" | "mc") {
        const questionDataCopy = QUtils.cloneQuestionData(questionData);
        questionDataCopy.type = type;

        const navCopyInitializer = QUtils.getNavInitializer(questionDataCopy);
        const newNav = new Nav<QBoxNode>(navCopyInitializer);
        newNav.goTo(curr);

        setQuestionData(questionDataCopy);
        setNav(newNav);
    }

    const writeData: (qd: QuestionData) => void = QUtils.writeData(
        pageStack,
        setPageStack,
    );

    useInput((input, key) => {
        if (!normal) {
            if (key.escape || key.return) {
                setNormal(true);
                writeData(questionData);
            }

            return;
        }

        if (normal && key.return) {
            if (curr === "qa" || curr === "qi" || curr === "mc") {
                setState(curr);
            }

            if (curr === "cancel") {
                const initializer = QUtils.getNavInitializer(
                    initialData.current,
                );
                const newNav: Nav<QBoxNode> = new Nav<QBoxNode>(initializer);
                newNav.goTo("cancel");
                setNav(newNav);
                setQuestionData(initialData.current);
                writeData(initialData.current);
            }
        }

        if (normal && input === "i") {
            if (
                curr === "question" ||
                curr === "answer" ||
                curr === "A" ||
                curr === "B" ||
                curr === "C" ||
                curr === "D" ||
                curr === "add"
            ) {
                setNormal(false);
            }
        }

        if (key.downArrow || input === "j") {
            nav.moveDown();
            setCurr(nav.getCurr());
        }

        if (key.upArrow || input === "k") {
            nav.moveUp();
            setCurr(nav.getCurr());
        }

        if (key.leftArrow || input === "h") {
            nav.moveLeft();
            setCurr(nav.getCurr());
        }

        if (key.rightArrow || input === "l") {
            nav.moveRight();
            setCurr(nav.getCurr());
        }
    });

    let questionContent: React.ReactNode;
    if (questionData.type === "qa") {
        questionContent = <Edit />;
    } else if (questionData.type === "qi") {
        questionContent = <Edit />;
    } else if (questionData.type === "mc") {
        questionContent = <EditMC />;
    }

    return (
        <>
            <QuestionPageContext.Provider
                value={{
                    questionData: questionData,
                    setQuestionData: setQuestionData,
                    pageStack: pageStack,
                    setPageStack: setPageStack,
                    nav: nav,
                    setNav: setNav,
                    curr: curr,
                    setCurr: setCurr,
                }}
            >
                <Box alignSelf="center">
                    <Text color="yellow" dimColor>
                        Edit Question
                    </Text>
                </Box>
                <HorizontalLine />
                <Box flexDirection="column" justifyContent="center">
                    <QuestionOptions />
                    {questionContent}
                </Box>
                <Box width="100%" justifyContent="space-between" marginTop={1}>
                    <Box borderStyle="round">
                        <Text>{`${normal ? "--NORMAL--" : "--INSERT--"}`}</Text>
                    </Box>
                    <Box>
                        <Box
                            borderStyle={curr === "cancel" ? "bold" : "round"}
                            borderColor={curr === "cancel" ? "blue" : ""}
                        >
                            <Text>Cancel</Text>
                        </Box>
                    </Box>
                </Box>
            </QuestionPageContext.Provider>
        </>
    );
}

type QuestionType = "mc" | "qa" | "qi";
function QuestionOptions(): React.ReactElement {
    const { questionData, curr } = useContext(QuestionPageContext)!;

    function isType(type: QuestionType): boolean {
        return questionData.type === type;
    }

    function isChecked(type: QuestionType): string {
        return isType(type) ? "[ x ] " : "[   ] ";
    }

    function isWithin(): boolean {
        return curr === "qa" || curr === "qi" || curr === "mc";
    }

    return (
        <Box
            flexDirection="column"
            width="100%"
            borderColor={isWithin() ? "blue" : ""}
            borderStyle={isWithin() ? "bold" : "round"}
        >
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

function Edit(): React.ReactElement {
    const { normal } = useContext(NormalContext)!;
    const { questionData, setQuestionData, curr } =
        useContext(QuestionPageContext)!;

    const [questionInput, setQuestionInput] = useState<string>(questionData.q);
    const [answerInput, setAnswerInput] = useState<string>(questionData.a);

    useEffect(() => {
        const questionDataCopy = QUtils.cloneQuestionData(questionData);
        questionDataCopy.q = questionInput;
        setQuestionData(questionDataCopy);
    }, [questionInput]);

    useEffect(() => {
        const questionDataCopy = QUtils.cloneQuestionData(questionData);
        questionDataCopy.a = answerInput;
        setQuestionData(questionDataCopy);
    }, [answerInput]);

    // for when changes are reverted
    useEffect(() => {
        setQuestionInput(questionData.q);
        setAnswerInput(questionData.a);
    }, [questionData]);

    function isValidAnswer(): boolean {
        if (questionData.type !== "mc") return true;

        const keys: string[] = [];
        for (let i = 0; i < questionData.choices.length; ++i) {
            keys.push(String.fromCharCode(65 + i));
        }

        return keys.includes(questionData.a);
    }

    function answerBorderColor(): string {
        if (!isValidAnswer()) {
            return "red";
        }

        return curr === "answer" ? "blue" : "";
    }

    return (
        <>
            <Box width="100%" justifyContent="space-around" gap={-1}>
                <Box
                    width="50%"
                    flexDirection="column"
                    alignItems="center"
                    borderColor={curr === "question" ? "blue" : ""}
                    borderStyle={curr === "question" ? "bold" : "round"}
                >
                    <Box>
                        <Text dimColor>Question: </Text>
                    </Box>
                    <HorizontalLine />
                    <TextInput
                        value={questionInput}
                        onChange={setQuestionInput}
                        focus={!normal && curr === "question"}
                    ></TextInput>
                </Box>
                <Box
                    width="50%"
                    flexDirection="column"
                    alignItems="center"
                    borderColor={answerBorderColor()}
                    borderStyle={curr === "answer" ? "bold" : "round"}
                >
                    <Box>
                        <Text dimColor>Answer: </Text>
                    </Box>
                    <HorizontalLine />
                    <TextInput
                        value={answerInput}
                        onChange={setAnswerInput}
                        focus={!normal && curr === "answer"}
                    ></TextInput>
                </Box>
            </Box>
        </>
    );
}

function EditMC(): React.ReactElement {
    const {
        questionData,
        setQuestionData,
        curr,
        setCurr,
        pageStack,
        setPageStack,
        setNav,
    } = useContext(QuestionPageContext)!;
    const { normal, setNormal } = useContext(NormalContext)!;
    const [addInput, setAddInput] = useState<string>("");

    const choices = questionData.choices;

    useInput((input, key) => {
        if ((normal && key.return) || (normal && input === "i")) {
            if (curr !== "add") return;
            setNormal(false);
        }

        if ((!normal && key.return) || (!normal && key.escape)) {
            if (curr !== "add") return;

            const questionDataCopy = QUtils.cloneQuestionData(questionData);
            const key = String.fromCharCode(
                65 + questionDataCopy.choices.length,
            ) as "A" | "B" | "C" | "D";
            questionDataCopy.choices.push({ [key]: `${addInput}` });
            const initializer = QUtils.getNavInitializer(questionDataCopy);
            const newNav: Nav<QBoxNode> = new Nav<QBoxNode>(initializer);
            newNav.goTo(key);
            newNav.moveDown();
            if (newNav.getCurr() === "cancel") {
                newNav.moveUp();
            }
            setCurr(newNav.getCurr());
            setAddInput("");

            const writeData: (qd: QuestionData) => void = QUtils.writeData(
                pageStack,
                setPageStack,
            );
            setNav(newNav);
            setQuestionData(questionDataCopy);
            writeData(questionDataCopy);

            setNormal(true);
        }

        if (normal && input === "d") {
            if (curr !== "A" && curr !== "B" && curr !== "C" && curr !== "D") {
                return;
            }

            const questionDataCopy = QUtils.cloneQuestionData(questionData);

            let toSplice: number | null = null;
            let nextKey: "A" | "B" | "C" | "D" | null = null;
            for (let i = 0; i < questionDataCopy.choices.length; ++i) {
                const key = String.fromCharCode(65 + i) as
                    | "A"
                    | "B"
                    | "C"
                    | "D";

                console.log("KEY AND CURR: " + key + " " + curr);
                if (key === curr) {
                    toSplice = i;
                    nextKey = key;
                    break;
                }
            }

            if (toSplice === null || nextKey === null)
                throw new Error("Could not find index to delete from");

            questionDataCopy.choices.splice(toSplice, 1);

            const initializer = QUtils.getNavInitializer(questionDataCopy);
            const newNav: Nav<QBoxNode> = new Nav<QBoxNode>(initializer);
            const nextNode: QBoxNode = newNav.returnIfValid(nextKey) || "add";
            newNav.goTo(nextNode);

            const writeData: (qd: QuestionData) => void = QUtils.writeData(
                pageStack,
                setPageStack,
            );
            setQuestionData(questionDataCopy);
            setNav(newNav);
            writeData(questionDataCopy);
        }
    });

    return (
        <>
            <Edit />
            {choices.map((choice, index) => {
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
                                    label={
                                        getLabel(index) as "A" | "B" | "C" | "D"
                                    }
                                />
                            </Box>
                        </Box>
                    </>
                );
            })}
            {choices.length >= 4 ? (
                <></>
            ) : (
                <Box width="100%">
                    <Text>{"   "}</Text>
                    <Box
                        flexGrow={1}
                        borderColor={curr === "add" ? "blue" : ""}
                        borderStyle={curr === "add" ? "bold" : "round"}
                    >
                        <Text>{Icons.add}</Text>
                        {!normal && curr === "add" ? (
                            <TextInput
                                value={addInput}
                                onChange={setAddInput}
                                focus={!normal && curr === "add"}
                            ></TextInput>
                        ) : (
                            <Text color="green">{"Add Option"}</Text>
                        )}
                    </Box>
                </Box>
            )}
        </>
    );
}

function MCText({
    desc,
    isFocused,
    label,
}: {
    desc: string;
    isFocused: boolean;
    label: "A" | "B" | "C" | "D";
}): React.ReactElement {
    const { curr, questionData, setQuestionData } =
        useContext(QuestionPageContext)!;

    const [mcInput, setMcInput] = useState<string>(desc);

    useEffect(() => {
        if (curr === label) {
            const questionDataCopy = QUtils.cloneQuestionData(questionData);

            for (const choice of questionDataCopy.choices) {
                const key = Object.keys(choice)[0];
                if (key === curr) {
                    choice[key] = mcInput;
                }
            }

            setQuestionData(questionDataCopy);
        }
    }, [mcInput]);

    // for when changes are reverted
    useEffect(() => {
        for (const choice of questionData.choices) {
            const key = Object.keys(choice)[0];
            if (key === label) {
                setMcInput(choice[key]);
            }
        }
    }, [questionData]);

    return (
        <TextInput
            value={mcInput}
            onChange={setMcInput}
            focus={isFocused}
        ></TextInput>
    );
}
