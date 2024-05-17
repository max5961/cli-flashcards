import React, { useState, useContext, createContext } from "react";
import { Box, Text } from "ink";
import { HorizontalLine } from "../shared/components/Lines.js";
import { FlexibleQuestion, QuestionTypes, Quiz } from "../types.js";
import { Window } from "../shared/hooks/useWindow.js";
import { Page, PageStack } from "../shared/utils/PageStack.js";
import { InputBox } from "../shared/components/InputBox.js";
import { FocusableBox } from "../shared/components/Focusable.js";
import { TitleBox } from "../shared/components/TitleBox.js";
import { ShowMode } from "../shared/components/ShowMode.js";
import { QpvNode } from "./utils/QpvUtils.js";
import { useLpv } from "./hooks/useLpv.js";
import { useQpv } from "./hooks/useQpv.js";
import { useEqt } from "./hooks/useEqt.js";
import { useQABox } from "./hooks/useQABoxes.js";
import { useAddChoice } from "./hooks/useAddChoice.js";
import { useMcChoices } from "./hooks/useMcChoices.js";
import { useMcText } from "./hooks/useMcText.js";
import { Icon } from "../shared/components/Icons.js";

interface PageContext {
    pageStack: PageStack;
    setPageStack: (ps: PageStack) => void;
}

export const PageContext = createContext<PageContext | null>(null);

interface EditPagesProps {
    quizzes: Quiz[];
}

export function EditModeView({ quizzes }: EditPagesProps): React.ReactNode {
    const [pageStack, setPageStack] = useState<PageStack>(
        new PageStack(quizzes),
    );

    const page: Page = pageStack.top();

    const currentPage: React.ReactNode =
        page.pageType === "QUESTION" ? <QuestionPageView /> : <ListPageView />;

    return (
        <PageContext.Provider
            value={{
                pageStack: pageStack,
                setPageStack: setPageStack,
            }}
        >
            {currentPage}
        </PageContext.Provider>
    );
}

function ListPageView(): React.ReactNode {
    const { page, edit, setEdit, window, currIndex, normal, message } =
        useLpv();

    function mapItems(items: any[]): React.ReactNode[] {
        const components: React.ReactNode[] = [];
        const isFocus = (i: number): boolean => i === currIndex;
        const acceptsInput = (i: number): boolean => !normal && isFocus(i);

        for (let i = 0; i < items.length; ++i) {
            components.push(
                <FocusableBox isFocus={isFocus(i)} key={i}>
                    <Box>
                        <Icon type="EDIT" />
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
                <Icon type="ADD" />
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
                <Text color="red">{message}</Text>
                <ShowMode normal={normal} />
            </TitleBox>
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
    normal: boolean;
    data: FlexibleQuestion;
    pageStack: PageStack;
    setPageStack: (ps: PageStack) => void;
    setData: (fq: FlexibleQuestion) => void;
    currNode: QpvNode;
    setCurrNode: (n: QpvNode) => void;
}

export const QpvContext = createContext<QpvContext | null>(null);

function QuestionPageView(): React.ReactNode {
    const {
        normal,
        data,
        setData,
        currNode,
        setCurrNode,
        pageStack,
        setPageStack,
    } = useQpv();

    return (
        <>
            <QpvContext.Provider
                value={{
                    normal,
                    data,
                    setData,
                    currNode,
                    setCurrNode,
                    pageStack,
                    setPageStack,
                }}
            >
                <TitleBox title={"Edit Question"}>
                    <ShowMode normal={normal} />
                </TitleBox>
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
    const isWithin = useEqt();

    return (
        <Box
            flexDirection="column"
            width="100%"
            borderColor={isWithin ? "blue" : ""}
            borderStyle={isWithin ? "bold" : "round"}
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
    const {
        questionBorderColor,
        questionAcceptsInput,
        answerBorderColor,
        answerAcceptsInput,
        questionInput,
        setQuestionInput,
        answerInput,
        setAnswerInput,
        currNode,
        data,
    } = useQABox();

    // build question and answer Boxes
    return (
        <Box width="100%" justifyContent="space-around" gap={-1}>
            <Box
                width="50%"
                flexDirection="column"
                alignItems="center"
                borderColor={questionBorderColor}
                borderStyle={currNode === "question" ? "bold" : "round"}
            >
                <Box>
                    <Text dimColor>Question: </Text>
                </Box>
                <HorizontalLine />
                <InputBox
                    acceptsInput={questionAcceptsInput}
                    value={questionInput}
                    onChange={setQuestionInput}
                    defaultText={data.q}
                />
            </Box>
            <Box
                width="50%"
                flexDirection="column"
                alignItems="center"
                borderColor={answerBorderColor}
                borderStyle={currNode === "answer" ? "bold" : "round"}
            >
                <Box>
                    <Text dimColor>Answer: </Text>
                </Box>
                <HorizontalLine />
                <InputBox
                    acceptsInput={answerAcceptsInput}
                    value={answerInput}
                    onChange={setAnswerInput}
                    defaultText={data.a}
                />
            </Box>
        </Box>
    );
}

function MCBoxes(): React.ReactNode {
    const { data, currNode } = useMcChoices();

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
    const { isFocus, acceptsInput, edit, setEdit } = useAddChoice();

    return (
        <Box width="100%">
            <Text>{"   "}</Text>
            <Box
                flexGrow={1}
                borderColor={isFocus ? "blue" : ""}
                borderStyle={isFocus ? "bold" : "round"}
            >
                <Icon type="ADD" />
                <InputBox
                    acceptsInput={acceptsInput}
                    value={edit}
                    onChange={setEdit}
                    defaultText={"Add Choice"}
                    defaultTextColor={"green"}
                />
            </Box>
        </Box>
    );
}

function McText({ index }: { index: number }): React.ReactNode {
    const { acceptsInput, edit, setEdit, defaultText } = useMcText(index);

    return (
        <InputBox
            acceptsInput={acceptsInput}
            value={edit}
            onChange={setEdit}
            defaultText={defaultText}
        />
    );
}
