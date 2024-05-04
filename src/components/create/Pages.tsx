import React, {
    useState,
    useContext,
    useEffect,
    useRef,
    createContext,
} from "react";
import { Box, Text, useInput } from "ink";
import { HorizontalLine } from "../shared/Lines.js";
import { NormalContext } from "../../App.js";
import { FlexibleQuestion, QuestionTypes, Quiz } from "../../types.js";
import { Window, useWindow } from "../../hooks/useWindow.js";
import { PageStack, Page, ListPage } from "../../utils/PageStack.js";
import { LpvUtil } from "../../utils/LpvUtils.js";
import { InputBox } from "../shared/InputBox.js";
import { FocusableBox } from "../shared/FocusableBox.js";
import { TitleBox } from "../shared/TitleBox.js";
import { ShowMode } from "../shared/ShowMode.js";
import { QpvNode, QpvUtils } from "../../utils/QpvUtils.js";
import { useNav } from "../../hooks/useNav.js";

enum Icons {
    edit = "  ",
    add = "  ",
}

export function CurrentPageView({
    initialQuizzes,
}: {
    initialQuizzes: Quiz[];
}): React.ReactNode {
    const initialPageStack: PageStack = new PageStack(initialQuizzes);
    const [pageStack, setPageStack] = useState<PageStack>(initialPageStack);

    const page: Page = pageStack.top();
    if (page.pageType === "QUESTION") {
        return (
            <QuestionPageView
                pageStack={pageStack}
                setPageStack={setPageStack}
            />
        );
    } else {
        return (
            <ListPageView pageStack={pageStack} setPageStack={setPageStack} />
        );
    }
}

interface LpvProps {
    pageStack: PageStack;
    setPageStack: (ps: PageStack) => void;
}
function ListPageView({ pageStack, setPageStack }: LpvProps): React.ReactNode {
    const { normal, setNormal } = useContext(NormalContext)!;
    const [edit, setEdit] = useState<string>("");
    const { window, currIndex, setCurrIndex } = useWindow(5);

    const page: ListPage = pageStack.top() as ListPage;

    useEffect(() => {
        setCurrIndex(page.lastIndex);
    }, [pageStack]);

    useInput((input, key) => {
        const util: LpvUtil = new LpvUtil();
        util.buildStack(pageStack);
        util.buildSetStack(setPageStack);
        util.buildIndex(currIndex);
        util.buildSetIndex(setCurrIndex);
        util.buildMaxIndex(page.listItems.length);
        util.buildNormal(normal);
        util.buildSetNormal(setNormal);

        if (normal && input === "j") {
            util.moveDown();
        }

        if (normal && input === "k") {
            util.moveUp();
        }

        if (normal && key.return) {
            util.enterNextPage(currIndex);
        }

        if (normal && key.delete) {
            util.backPrevPage();
        }

        if (normal && input === "d") {
            util.removeListItem(currIndex);
        }

        if (normal && input === "i") {
            setEdit(page.getItemDesc(currIndex));
            util.enterInsert(currIndex);
        }

        if (normal && input === "c") {
            setEdit("");
            util.enterInsert(currIndex);
        }

        if ((!normal && key.escape) || (!normal && key.return)) {
            util.setListItemName(currIndex, edit);
            util.enterNormal();
        }
    });

    function mapItems(items: any[]): React.ReactNode[] {
        const components: React.ReactNode[] = [];
        const isFocus = (i: number): boolean => i === currIndex;
        const acceptsInput = (i: number): boolean => !normal && isFocus(i);

        for (let i = 0; i < items.length; ++i) {
            components.push(
                <FocusableBox isFocus={isFocus(i)} key={i}>
                    <Box>
                        <Text color="yellow">{Icons.edit}</Text>
                        <InputBox
                            acceptsInput={acceptsInput(i)}
                            value={edit}
                            onChange={setEdit}
                            defaultText={page.getItemDesc(i)}
                        ></InputBox>
                    </Box>
                </FocusableBox>,
            );
        }

        // add items box
        const i = items.length;
        components.push(
            <FocusableBox isFocus={isFocus(i)} key={i}>
                <Text color="green">{Icons.add}</Text>
                <InputBox
                    acceptsInput={acceptsInput(i)}
                    value={edit}
                    onChange={setEdit}
                    defaultText={page.addItemText}
                ></InputBox>
            </FocusableBox>,
        );

        return components;
    }

    return (
        <>
            <TitleBox title={page.title}>
                <ShowMode normal={normal} />
            </TitleBox>
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

interface QpvContext {
    pageStack: PageStack;
    setPageStack: (ps: PageStack) => void;
    data: FlexibleQuestion;
    setData: (fq: FlexibleQuestion) => void;
    currNode: QpvNode;
}

const QpvContext = createContext<QpvContext | null>(null);

interface QpvProps {
    pageStack: PageStack;
    setPageStack: (ps: PageStack) => void;
}

function QuestionPageView({
    pageStack,
    setPageStack,
}: QpvProps): React.ReactNode {
    const { normal, setNormal } = useContext(NormalContext)!;

    const defaultData: FlexibleQuestion = QpvUtils.getFlexibleData(pageStack);
    const [data, setData] = useState<FlexibleQuestion>(defaultData);

    // used for reverting changes
    const initialData = useRef<FlexibleQuestion>(defaultData);

    const currNode: QpvNode = useNav<QpvNode, FlexibleQuestion>(
        data,
        QpvUtils.getNavInit,
        normal,
    );

    useInput((input, key) => {
        const validNodes: QpvNode[] = [
            "question",
            "answer",
            "A",
            "B",
            "C",
            "D",
        ];
        if (normal && input === "i") {
            if (validNodes.includes(currNode)) {
                setNormal(false);
            }
        }
    });

    return (
        <>
            <QpvContext.Provider
                value={{
                    pageStack: pageStack,
                    setPageStack: setPageStack,
                    data: data,
                    setData: setData,
                    currNode: currNode,
                }}
            >
                <TitleBox title={"Edit Question"}>
                    <ShowMode normal={normal} />
                </TitleBox>
                <HorizontalLine />
                <Box flexDirection="column" justifyContent="center">
                    <EditQuestionType />
                    <QuestionContents />
                </Box>
                <Box width="100%" justifyContent="flex-end" marginTop={1}>
                    <Box
                        borderStyle={currNode === "cancel" ? "bold" : "round"}
                        borderColor={currNode === "cancel" ? "blue" : ""}
                    >
                        <Text>Cancel</Text>
                    </Box>
                </Box>
            </QpvContext.Provider>
        </>
    );
}

function EditQuestionType(): React.ReactNode {
    const { currNode } = useContext(QpvContext)!;

    function isWithin(): boolean {
        return currNode === "qa" || currNode === "qi" || currNode === "mc";
    }

    return (
        <Box
            flexDirection="column"
            width="100%"
            borderColor={isWithin() ? "blue" : ""}
            borderStyle={isWithin() ? "bold" : "round"}
        >
            <EqtItem itemType={"qa"} textContent={"Question Answer"} />
            <EqtItem itemType={"qi"} textContent={"Question Input"} />
            <EqtItem itemType={"mc"} textContent={"Multiple Choice"} />
        </Box>
    );
}

interface EqtItemProps {
    itemType: QuestionTypes;
    textContent: string;
}

function EqtItem({ itemType, textContent }: EqtItemProps): React.ReactNode {
    const { currNode, data } = useContext(QpvContext)!;

    function isChosen(): boolean {
        return itemType === data.type;
    }

    function getColor(): string {
        if (currNode === itemType) return "blue";
        return "";
    }

    function checkBox(): string {
        return isChosen() ? "[ x ] " : "[   ] ";
    }

    return (
        <Box alignItems="center">
            <Text color={isChosen() ? "green" : ""}>{checkBox()}</Text>
            <Text color={getColor()}>{textContent}</Text>
        </Box>
    );
}

function QuestionContents(): React.ReactNode {
    const { data } = useContext(QpvContext)!;
    if (data.type === "mc") {
        return (
            <>
                <QandABoxes />
                <MCBoxes />
            </>
        );
    }

    return <QandABoxes />;
}

function QandABoxes(): React.ReactNode {
    const { normal } = useContext(NormalContext)!;
    const { data, pageStack, currNode } = useContext(QpvContext)!;

    const [questionInput, setQuestionInput] = useState<string>("");
    const [answerInput, setAnswerInput] = useState<string>("");

    useEffect(() => {
        setQuestionInput("");
        setAnswerInput("");
    }, [pageStack]);

    function acceptsInput(node: QpvNode): boolean {
        return currNode === node && !normal;
    }

    function borderColor(node: QpvNode): string {
        if (currNode === node) {
            return "blue";
        }
        return "";
    }

    function answerBorderColor(node: QpvNode): string {
        if (data.type !== "mc") return borderColor(node);

        const possibleValues: string[] = [];
        for (let i = 0; i < data.choices.length; ++i) {
            possibleValues.push(String.fromCharCode(65 + i));
        }

        if (
            !possibleValues.includes(answerInput) &&
            !possibleValues.includes(data.a)
        ) {
            return "red";
        } else {
            return borderColor(node);
        }
    }

    // build question and answer Boxes
    return (
        <Box width="100%" justifyContent="space-around" gap={-1}>
            <Box
                width="50%"
                flexDirection="column"
                alignItems="center"
                borderColor={borderColor("question")}
                borderStyle={currNode === "question" ? "bold" : "round"}
            >
                <Box>
                    <Text dimColor>Question: </Text>
                </Box>
                <HorizontalLine />
                <InputBox
                    acceptsInput={acceptsInput("question")}
                    value={questionInput}
                    onChange={setQuestionInput}
                    defaultText={data.q}
                />
            </Box>
            <Box
                width="50%"
                flexDirection="column"
                alignItems="center"
                borderColor={answerBorderColor("answer")}
                borderStyle={currNode === "answer" ? "bold" : "round"}
            >
                <Box>
                    <Text dimColor>Answer: </Text>
                </Box>
                <HorizontalLine />
                <InputBox
                    acceptsInput={acceptsInput("answer")}
                    value={answerInput}
                    onChange={setAnswerInput}
                    defaultText={data.a}
                />
            </Box>
        </Box>
    );
}

function MCBoxes(): React.ReactNode {
    const { data, currNode } = useContext(QpvContext)!;

    function mapChoices(): React.ReactNode[] {
        const built: React.ReactNode[] = [];
        const getLabel = (index: number) => String.fromCharCode(65 + index);

        for (let i = 0; i < data.choices.length; ++i) {
            const label: string = getLabel(i);
            built.push(
                <Box width="100%" alignItems="center" key={i}>
                    <Box>
                        <Text bold>{`${label}: `}</Text>
                    </Box>
                    <FocusableBox isFocus={currNode === label}>
                        <McText index={i} />
                    </FocusableBox>
                </Box>,
            );
        }

        return built;
    }

    return (
        <>
            {mapChoices()}
            {data.choices.length < 4 ? <AddChoice /> : <></>}
        </>
    );
}

function AddChoice(): React.ReactNode {
    const { normal } = useContext(NormalContext)!;
    const { currNode } = useContext(QpvContext)!;
    const [edit, setEdit] = useState<string>("");

    const isFocus = currNode === "add";
    const acceptsInput = isFocus && !normal;

    return (
        <Box width="100%">
            <Text>{"   "}</Text>
            <Box
                flexGrow={1}
                borderColor={isFocus ? "blue" : ""}
                borderStyle={isFocus ? "bold" : "round"}
            >
                <Text>{Icons.add}</Text>
                <InputBox
                    acceptsInput={acceptsInput}
                    value={edit}
                    onChange={setEdit}
                    defaultText={"Add Choice"}
                    textColor={"green"}
                />
            </Box>
        </Box>
    );
}

function McText({ index }: { index: number }): React.ReactNode {
    const { normal } = useContext(NormalContext)!;
    const { data, currNode, pageStack } = useContext(QpvContext)!;
    const [edit, setEdit] = useState<string>("");

    useEffect(() => {
        setEdit("");
    }, [pageStack]);

    function getLabel(index: number): string {
        return String.fromCharCode(65 + index);
    }

    const acceptsInput: boolean = !normal && getLabel(index) === currNode;

    return (
        <InputBox
            acceptsInput={acceptsInput}
            value={edit}
            onChange={setEdit}
            defaultText={data.choices[index]}
        />
    );
}
